import React, { PureComponent, Fragment } from 'react';


import debounce from "lodash/debounce";

import './style.css';

//import bricks from './bricks';

import bricks from './b1';

export default class Game extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            // each ball it's another 1
            ballsArr: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,],
            ballSpeed: 600,
            showField: false,
            winning: false,
            countdown: {
                sec: 3,
                show: false,
            },
        };

        this.brokenBricks = 0;
        this.animations = 0;
        this.canceledRequests = 0;
        this.decreaseBtn = 0;

        this.gameParams = {
            width: 700,
            height: 700,
            lives: 100,
            score: 0,
            paddingBottom: 30,
            dt: 1 / 50, // 50fps

            balls: [],

            paddle: {
                x:0,
                y:0,
                width: 100,
                height: 16,
                last_x: 0,
                speed: 300,
            },

            ballNodes: [],

            // elements (DOM nodes)
            // brickNodes: this.brickNodes,

            // livesNode: null,
            // scoreNode: null,
            // paddleNode: null,
        }

        this.ballParams = {
            x: 0,
            y: 0,
            last_x: 0,
            last_y: 0,
            radius: 5,
            diam: 10,
            //  theta is the angle the ball direction makes with the x axis. from -PI to PI, -PI/2 is vertically up, PI/2 is verticall down
            theta: (-1 * Math.PI) / 2,
            id: 0,
        };

        this.playMusic = debounce(this.playMusic, 100);
        this.increaseSpeed = debounce(this.increaseSpeed, 100);
        this.decreaseSpeed = debounce(this.decreaseSpeed, 100);

        this.increaseBalls = debounce(this.increaseBalls, 100);
        this.decreaseBalls = debounce(this.decreaseBalls, 100);


        window.requestAnimationFrame = window.requestAnimationFrame
            || window.mozRequestAnimationFrame
            || window.webkitRequestAnimationFrame
            || window.msRequestAnimationFrame
            || function(f){return setTimeout(f, 1000/60)};

        window.cancelAnimationFrame = window.cancelAnimationFrame
            || window.mozCancelAnimationFrame
            || function(requestID){clearTimeout(requestID)} //fall back
    }

    componentDidMount() {
        console.log('mount');
        console.log(this.gameParams.fieldNode);

        document.addEventListener('keydown', (e) => {

            console.log(e.keyCode);

            if (e.keyCode === 32) {

                if (!this.gameStarted) {
                    this.gameStarted = true;
                    console.log('aaaaaaaaaaaaaaaaaaaaaaaaa');
                    this.startGame();
                }
            }


        }, false);

        // if (this.gameParams.fieldNode) {
        //
        //     const gp = this.gameParams;
        //
        //     this.initParams(gp);
        //     this.handlePaddleMovement(gp);
        //     this.draw(gp);
        //
        //
        //     document.addEventListener('keydown', (e) => {
        //
        //         console.log(e.keyCode);
        //
        //         if (e.keyCode === 13) {
        //             console.log('aaaaaaaaaaaaaaaaaaaaaaaaa');
        //             this.startGame();
        //         }
        //
        //
        //     }, false);
        // }
    }

    componentDidUpdate() {
        console.log('update');
        if (this.gameParams.fieldNode
            && this.gameParams.ballNodes) {

            // console.log(this.requestframeref);
            // console.log(window);
            console.log(this.gameParams.ballNodes);

            // console.log('CCCCCCCCFFFFFRRRRRROOOOOOMMMMUUUUUPPPPPDDAATTTEEE');

            //window.cancelAnimationFrame(this.requestframeref);

            this.cancelAnimation();


            const gp = this.gameParams;

            this.initParams(gp);
            this.handlePaddleMovement(gp);
            this.draw(gp);
        }
    }

    // Return a random number in between x and y
    random(x, y) {
        return x + (Math.random() * (y - x));
    }

    // Return a suitable start angle
    getThetaStartAngle = () => {
        return this.random((-1 / 6) * Math.PI, (-5 / 6) * Math.PI);  //from -150 to -30 degrees
    }

    initParams = ({width, height, paddle, balls, paddingBottom, paddleNode, ballNodes}) => {
        /*---------------------------------------- bricks -----------------*/
        // count visible bricks
        let counts = {};

        bricks.forEach((arr) => {
            arr.forEach((x) => {
                counts[x] = (counts[x] || 0)+1;
            });
        });

        this.visibleBricksCount = counts[1];
        /*---------------------------------------- end bricks -----------------*/

        paddle.x = width / 2 - (paddle.width / 2);
        paddle.y = height - paddle.height - paddingBottom;

        paddleNode.style.left = `${paddle.x}px`;
        paddleNode.style.top = `${paddle.y}px`;

        //debugger

        if (balls.length !== this.state.ballsArr.length) {
            balls.length = 0;

            this.state.ballsArr.forEach((elem, i) => {
                balls.push({...this.ballParams, id: i});
            });
        }

        balls.forEach((ball, i) => {
            // Set a random start direction for the ball
            ball.theta = this.getThetaStartAngle();

            ball.x = paddle.x;
            ball.y = paddle.y - ball.diam;
        });
    }

    handlePaddleMovement = ({paddle, paddleNode, width, fieldNode}) => {

        document.addEventListener('mousemove', (e) => {
            let pageX = parseInt(e.pageX, 10);
            let fieldLeftBound = fieldNode.getBoundingClientRect().x;

            if (pageX < fieldLeftBound) {
                paddle.x = 0;
            } else if ((pageX + paddle.width) > (fieldLeftBound + width)) {
                paddle.x = width - paddle.width;

            } else {
                paddle.x = pageX - fieldLeftBound;
            }

            paddleNode.style.left = `${paddle.x}px`;
        }, false);
    }

    reflectBallFromTop = (ball) => {
        ball.theta = -1 * ball.theta;
    }

    reflectBallFromBottom = (ball) => {
        ball.theta = -1 * ball.theta;
    }

    reflectBallFromLeft = (ball) => {
        ball.theta = -1 * Math.PI - ball.theta;
    }

    reflectBallFromRight = (ball) => {
        ball.theta = Math.PI - ball.theta;
    }

    reflectBallFromPaddle = (ball, paddle) => {

        // Angle of reflection is entirely down to where on the paddle the ball hits
        let diff = (ball.x - ball.radius) - (paddle.x + paddle.width / 2);
        let maxDiff = paddle.width / 2 + ball.radius;
        let maxDeflection = (1 / 6) * Math.PI;

        // edge case 1
        if (diff > maxDiff) {
            ball.theta = -1 * maxDeflection;
            return;
        }
        // edge case 2
        if (diff < -1 * maxDiff) {
            ball.theta = -1 * Math.PI + maxDeflection;
            return;
        }

        ball.theta = -1 * (Math.PI / 2) + (diff / maxDiff) * ((Math.PI/2) - maxDeflection);
    }

    rectangleIntersect = (c1_x, c1_y, width1, height1, c2_x, c2_y, width2, height2) => {

        let p1_x = c1_x - width1 / 2;
        let p1_y = c1_y - height1 / 2;
        let p2_x = c2_x - width2 / 2;
        let p2_y = c2_y - height2 / 2;

        if (p1_x < p2_x + width2 &&
            p1_x + width1 > p2_x &&
            p1_y < p2_y + height2 &&
            height1 + p1_y > p2_y) {
            return true;
        }
        return false;
    }

    /**
     * Calculates the side to which the ball hits
     */
    /**
     * Calculates part of rectangle depending on the coordinates
     * @param w - width
     * @param h - height
     * @param x - coordinate X, origin in the middle of rectangle
     * @param y - coordinate Y, origin in the middle of rectangle
     * @returns {number} 0: top, 1: right, 2: bottom, 3: left
     */
    calcRectPart = (w, h, x, y) => {
        let d;
        let angle = Math.atan(h/w)/(Math.PI / 180);
        let pointAngle = Math.abs(Math.atan(y/x)/(Math.PI / 180));
        let angle2 = Math.atan(w/h)/(Math.PI / 180);
        let pointAngle2 = Math.abs(Math.atan(x/y)/(Math.PI / 180));

        if (y < 0 && angle < pointAngle) {d = 0;}
        if (x > 0 && angle2 < pointAngle2) {d = 1;}
        if (y > 0 && angle < pointAngle) {d = 2;}
        if (x < 0 && angle2 < pointAngle2) {d = 3;}

        return d;
    };

    getRectPart = (elem, x, y, last_x, last_y) => {
        let w = elem.offsetWidth;
        let h = elem.offsetHeight;

        // coords of ball relatively to brick middle
        let coordX = (x - elem.offsetLeft - (w / 2) );
        let coordY = (y - elem.offsetTop - (h / 2) );

        let coordLastX = (last_x - elem.offsetLeft - (w / 2) );
        let coordLastY = (last_y - elem.offsetTop - (h / 2) );

        const coef = 5; // 5px
        const diffY = (y - last_y) + coef;
        const diffX = (x - last_x) + coef;

        //return this.calcRectPart(w, h, coordX, coordY);
        return this.calcRectPart(w + (2 * diffX), h + (2 * diffY), coordX, coordY);
    }


    calcMovementAndCollisions = (width, height, brickNodes, ball, ballNodes, paddle, dt) => {
        // Move the ball
        ball.last_x = ball.x;
        ball.last_y = ball.y;

        ball.x += dt * this.state.ballSpeed * Math.cos(ball.theta);
        ball.y += dt * this.state.ballSpeed * Math.sin(ball.theta);

        //debugger

        // forbid a ball to go beyond
        if (ball.x < 0) { ball.x = 0; }
        if (ball.y < 0) { ball.y = 0; }
        if ((ball.x + ball.diam) > width) { ball.x = width - ball.diam; }
        if ((ball.y + ball.diam) > height) { ball.y = height - ball.diam; }

//console.log(ball);

        // Check for collisions with the bounds
        if (ball.x <= 0) {
            this.reflectBallFromLeft(ball);
        }

        if (ball.x >= width - ball.diam) {
            this.reflectBallFromRight(ball);
        }

        if (ball.y <= 0) {
            //game.sounds.playSound('pong');
            this.reflectBallFromTop(ball);
        }

        // Check for collisions with the bottom
        if (ball.y >= height - ball.diam) {
            //this.looseLife();
            this.reflectBallFromBottom(ball);
        }


        /*------------------------------------------------
            check for collisions with the paddle
        --------------------------------------------------*/
        const brickWidth = brickNodes[0].offsetWidth;
        const brickHeight = brickNodes[0].offsetHeight;

        let correctionDims = ball.radius;

        if (this.state.ballSpeed > 300 && this.state.ballSpeed <= 400) {
            correctionDims = ball.radius + (ball.radius / 2);
        } else if (this.state.ballSpeed > 500) {
            correctionDims = ball.diam;
        }

        // console.log(correctionDims);
        // console.log(this.state.ballSpeed);

        let paddleCollision = this.rectangleIntersect(
            paddle.x + (paddle.width / 2), paddle.y + (paddle.height / 2), paddle.width, paddle.height,
            ball.x + ball.radius, ball.y + correctionDims, ball.diam, ball.diam
        );

        if (paddleCollision) {
            if (this.isBallReflectingFromPaddle) {
                // we have a collision but ball is already reflecting from the paddle so ignore it
            } else {
                console.log('collision ball Y: ',ball.y);

                this.isBallReflectingFromPaddle = true;
                this.reflectBallFromPaddle(ball, paddle);
            }
        } else {
            this.isBallReflectingFromPaddle = false;
        }


        // on which row the ball is located (begining from 0)
        const row = Math.ceil((parseInt(ball.y) + ball.radius) / brickHeight) - 1;

        // on which col the ball is located (begining from 0)
        const col = Math.ceil((parseInt(ball.x) + ball.radius) / brickWidth) - 1;

        let cell = brickNodes[row * (width / brickWidth) + col];

        if (cell && cell.classList.contains('brick') && !cell.classList.contains('removed')) {

            this.brokenBricks += 1;

            cell.classList.add('removed');

            // const cellPart = this.getRectPart(cell, ball.x + ball.radius, ball.y + ball.radius);
            const cellPart = this.getRectPart(
                cell,
                ball.x + ball.radius,
                ball.y + ball.radius,
                ball.last_x + ball.radius,
                ball.last_y + ball.radius,
            );

            if (cellPart === 0) {
                this.reflectBallFromBottom(ball);
            }

            if (cellPart === 1) {
                this.reflectBallFromLeft(ball);
            }

            if (cellPart === 2) {
                this.reflectBallFromTop(ball);
            }

            if (cellPart === 3) {
                this.reflectBallFromRight(ball);
            }
        }

        /*---------------------------------------------------------------------
                end ball movement
        * -------------------------------------------------------------------*/
    }


    draw = ({ width, height, brickNodes, balls, ballNodes, paddle, dt }) => {

        console.log('animations: ',this.animations);
        console.log('decreqaseBtn: ',this.decreaseBtn);
        console.log('canceled: ',this.canceledRequests);
        console.log(ballNodes);
        const frame = (time) => {
            /*---------------------------------------------------------------------
                    ball movement
            * -------------------------------------------------------------------*/

            // console.log(this.state.ballSpeed);
            // console.log('delta X:',dt * this.state.ballSpeed * Math.cos(ball.theta));
            // console.log('delta Y:',dt * this.state.ballSpeed * Math.sin(ball.theta));

            //console.log(ballNodes);

            balls.forEach((ball, i) => {
                this.calcMovementAndCollisions(width, height, brickNodes, ball, ballNodes, paddle, dt);

                //console.log(ballNodes);

                if (ballNodes[i]) {
                    ballNodes[i].style.left = `${ball.x}px`;
                    ballNodes[i].style.top = `${ball.y}px`;
                }
            });

            // this.ballNodes.forEach((ball) => {
            //
            // });


            // ballNode.style.left = `${ball.x}px`;
            // ballNode.style.top = `${ball.y}px`;

            if (this.brokenBricks < this.visibleBricksCount) {
                this.requestframeref = window.requestAnimationFrame(frame);

                //console.log('last id: ', this.requestframeref);

            } else {
                console.log('WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWiiiiiiiiiinnnnnnnnnnnn');
                //window.cancelAnimationFrame(this.requestframeref);
                this.cancelAnimation();
                this.winTheGame();
            }
        }

        // if (!this.requestframeref) {
        //
        // }

        //this.cancelAnimation();
        console.log(this.requestframeref);
        //debugger
        //calls only once after update
        window.requestAnimationFrame(frame);
        //this.requestframeref = window.requestAnimationFrame(frame);
        this.animations += 1;

    }

    winTheGame = () => {
        this.setState(prevState => ({
            winning: true,
        }))

        this.winningSong.volume = 0.2;
        this.winningSong.loop = true;
        this.winningSong.play();
        this.mute.parentNode.style.display = 'none';
    }

    playWinningVideo = (vid) => {
        if (vid) {
            vid.loop = true;
            vid.play();
            console.log(vid);

            this.playMusic();
            //this.playWinningSong();
        }
    }


    playMusic = () => {
        console.log('TOGGLE MUSIC');

        this.mute.classList.toggle('on');

        if (this.song.paused) {
            this.song.play();
        }else{
            this.song.pause();
        }
    }


    increaseSpeed = () => {

        if (this.state.ballSpeed < 600) {
            console.log('INCREASE');

            this.setState(prevState => ({
                ballSpeed: prevState.ballSpeed + 100,
            }));
        }
    }

    decreaseSpeed = () => {
        console.log('decreace');
        if (this.state.ballSpeed > 100) {
            this.decreaseBtn += 1;
            console.log('DECREASE');
            //this.cancelAnimation();

            this.setState(prevState => ({
                ballSpeed: prevState.ballSpeed - 100,
            }));
        }
    }

    increaseBalls = () => {

        this.setState(prevState => ({
            ballsArr: [...prevState.ballsArr, 1],
        }));

        console.log(this.state.ballsArr);
    }

    decreaseBalls = () => {
        console.log('decreace');
        if (this.state.ballsArr.length > 1) {
            //this.decreaseBtn += 1;
            console.log('DECREASE BALL');

            const newArr = this.state.ballsArr.slice(0, -1);

            this.setState(prevState => ({
                ballsArr: newArr,
            }));
            console.log(this.state.ballsArr);
        }
    }

    tick() {
        console.log(this.state.countdown);
        if (this.state.countdown.sec <= 1) {
            this.setState(prevState => ({
                showField: true,
                countdown: {
                    ...prevState.countdown,
                    show: false,
                },
            }));

            this.playMusic();

            clearInterval(this.interval);

        } else {

            console.log(this.state.countdown);
            this.setState(prevState => ({
                countdown: {
                    ...prevState.countdown,
                    sec: prevState.countdown.sec - 1,
                },
            }));
        }
    }

    startGame = () => {

        this.greeting.style.display = 'none';

        this.song.volume = 0.2;
        this.song.loop = true;

        this.interval = setInterval(() => this.tick(), 1000);

        this.setState(prevState => ({
            countdown: {
                ...prevState.countdown,
                show: true,
            },
        }));
    }

    cancelAnimation = () => {

        window.cancelAnimationFrame(this.requestframeref);
        console.log('CANCELLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL FUNC');
    }


    render() {
        const {
            paddle,
        } = this.gameParams;

        console.log('render');

        const ballStyle = {
            width: this.ballParams.diam,
            height: this.ballParams.diam,
        };

        const paddleStyle = {
            width: paddle.width,
            height: paddle.height,
        };

        return (
            <div className="game-container">

                {this.state.showField &&
                    <div className="navbar">

                        <div className="navbar-item speed-block">
                            <span className="label">speed &nbsp;&nbsp;</span>
                            <button className="button" onClick={this.decreaseSpeed}>
                                <i className="fa fa-caret-down" />
                            </button>

                            <span className="speedboard">
                                &nbsp;&nbsp;{this.state.ballSpeed / 100}&nbsp;&nbsp;
                            </span>

                            <button className="button" onClick={this.increaseSpeed}>
                                <i className="fa fa-caret-up" />
                            </button>
                            <span>&nbsp;&nbsp;( cig / hour )&nbsp;</span>
                        </div>

                        <div className="navbar-item balls-block">
                            <span className="label">balls </span>
                            <button className="button" onClick={this.decreaseBalls}>
                                <i className="fa fa-caret-down" />
                            </button>

                            <span className="speedboard">
                                &nbsp;&nbsp;{this.state.ballsArr.length}&nbsp;&nbsp;
                            </span>

                            <button className="button" onClick={this.increaseBalls}>
                                <i className="fa fa-caret-up" />
                            </button>
                            <span>&nbsp;&nbsp;( nicotine, % )&nbsp;</span>

                        </div>

                        <div className="navbar-item">
                            <button
                                ref={(m) => {this.mute = m}}
                                className="button mute"
                                onClick={this.playMusic}
                            >
                            </button>
                        </div>

                    </div>
                }

                {!this.state.showField &&
                    <div ref={(g) => {this.greeting = g}} className="greeting">
                        Press "space" to play
                    </div>
                }

                {this.state.countdown.show &&
                    <div className="countdown">
                        {this.state.countdown.sec}
                    </div>
                }

                {this.state.showField &&
                    <div className="field-wrap">
                        <div
                            ref={(field) => {
                                if (field) {
                                    this.gameParams.brickNodes = field.children;
                                    this.gameParams.fieldNode = field;
                                }
                            }}
                            id="field"
                        >

                            {bricks.map((row, i) => {
                                return row.map((col, k) => {
                                    //console.log(col);
                                    return (
                                        <div key={i+k} brickrow={`${i}`} brickcol={`${k}`} className={`${col === 0 ? 'cell': 'brick'}`}/>
                                    );
                                });

                            })

                            }
                            /*--------------------------------------------------------
                                balls
                            ----------------------------------------------------------*/
                            {!this.state.winning && this.state.ballsArr.map((b, i) => {
                                return(
                                    <div
                                        key={`key${i+1}`}
                                        ref={(ball) => {this.gameParams.ballNodes[i] = ball}}
                                        ballkey={i}
                                        style={ballStyle}
                                        id="ball"
                                    />
                                );
                            })

                            }

                            <div ref={(paddle) => {this.gameParams.paddleNode = paddle}} style={paddleStyle} id="paddle" />

                            {this.state.winning &&
                                <Fragment>
                                    <video ref={this.playWinningVideo} className="win-video">
                                        <source src="media/lazy_dance.mp4" type="video/mp4" />
                                    </video>

                                </Fragment>
                            }
                        </div>
                    </div>
                }
                <audio ref={(elem) => {this.song = elem}} id="justAcigarette">
                    <source src="media/princess-chelsea-the-cigarette-duet.mp3" type="audio/mpeg"/>
                </audio>
                <audio ref={(elem) => {this.winningSong = elem}} id="winMusic">
                    <source src="media/win_music.mp3" type="audio/mpeg"/>
                </audio>

            </div>
        );
    }
}


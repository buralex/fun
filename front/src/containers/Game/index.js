import React, { PureComponent } from 'react';

import './style.css';

import bricks from './bricks';

//import bricks from './b1';

export default class Game extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            ballsCount: 2,
            ballSpeed: 300,
            showField: false,
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

            // initial positioning
            ball: {
                x: 0,
                y: 0,
                radius: 5,
                diam: 10,
                //  theta is the angle the ball direction makes with the x axis. from -PI to PI, -PI/2 is vertically up, PI/2 is verticall down
                theta: (-1 * Math.PI) / 2,
            },
            paddle: {
                x:0,
                y:0,
                width: 100,
                height: 16,
                last_x: 0,
                speed: 300,
            },

            // elements (DOM nodes)
            // brickNodes: this.brickNodes,
            // ballNode: null,
            // livesNode: null,
            // scoreNode: null,
            // paddleNode: null,
        }


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
        if (this.gameParams.fieldNode) {

            const gp = this.gameParams;

            this.initParams(gp);
            this.handlePaddleMovement(gp);
            this.draw(gp);
        }
    }

    componentDidUpdate() {
        console.log('update');
        if (this.gameParams.fieldNode) {

            console.log(this.requestframeref);
            console.log(window);

            console.log('CCCCCCCCFFFFFRRRRRROOOOOOMMMMUUUUUPPPPPDDAATTTEEE');

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

    initParams = ({width, height, paddle, ball, paddingBottom, paddleNode, ballNode}) => {

        // count visible bricks
        let counts = {};

        bricks.forEach((arr) => {
            arr.forEach((x) => {
                counts[x] = (counts[x] || 0)+1;
            });
        });

        this.visibleBricksCount = counts[1];

        // Set a random start direction for the ball
        ball.theta = this.getThetaStartAngle();

        paddle.x = width / 2 - (paddle.width / 2);
        paddle.y = height - paddle.height - paddingBottom;

        ball.x = paddle.x;
        ball.y = paddle.y - ball.diam;

        paddleNode.style.left = `${paddle.x}px`;
        paddleNode.style.top = `${paddle.y}px`;

        ballNode.style.left = `${ball.x}px`;
        ballNode.style.top = `${ball.y}px`;
    }

    handlePaddleMovement = ({paddle, paddleNode, width, fieldNode}) => {

        document.addEventListener('mousemove', (e) => {
            //console.log('MOVEMENT_____________');
            let pageX = parseInt(e.pageX);
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

    getRectPart = (elem, x, y) => {
        let w = elem.offsetWidth;
        let h = elem.offsetHeight;

        // coords of ball relatively to brick middle
        let coordX = (x - elem.offsetLeft - (w / 2) );
        let coordY = (y - elem.offsetTop - (h / 2) );

        return this.calcRectPart(w, h, coordX, coordY);
    }


    calcMovementAndCollisions = () => {
        // Move the ball
        ball.x += dt * this.state.ballSpeed * Math.cos(ball.theta);
        ball.y += dt * this.state.ballSpeed * Math.sin(ball.theta);

        // forbid a ball to go beyond
        if (ball.x < 0) { ball.x = 0; }
        if (ball.y < 0) { ball.y = 0; }
        if ((ball.x + ball.diam) > width) { ball.x = width - ball.diam; }
        if ((ball.y + ball.diam) > height) { ball.y = height - ball.diam; }



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


        // check for collisions with the paddle
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
                //.sounds.playSound('pong');
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

            const cellPart = this.getRectPart(cell, ball.x + ball.radius, ball.y + ball.radius);

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


    draw = ({ width, height, brickNodes, balls, ballNode, paddle, paddleNode, lives, dt }) => {

        console.log('animations: ',this.animations);
        console.log('decreqaseBtn: ',this.decreaseBtn);
        console.log('canceled: ',this.canceledRequests);

        const frame = (time) => {
            /*---------------------------------------------------------------------
                    ball movement
            * -------------------------------------------------------------------*/

            // console.log(this.state.ballSpeed);
            // console.log('delta X:',dt * this.state.ballSpeed * Math.cos(ball.theta));
            // console.log('delta Y:',dt * this.state.ballSpeed * Math.sin(ball.theta));

            this.balls.forEach((ball) => {

            });


            ballNode.style.left = `${ball.x}px`;
            ballNode.style.top = `${ball.y}px`;

            if (this.brokenBricks < this.visibleBricksCount) {
                this.requestframeref = window.requestAnimationFrame(frame);

                console.log('last id: ', this.requestframeref);

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

    }


    increaseSpeed = () => {

        if (this.state.ballSpeed < 600) {
            console.log('INCREASE');

            //this.cancelAnimation();

            this.setState(prevState => ({
                ballSpeed: prevState.ballSpeed + 100,
            }));
        }
    }

    decreaseSpeed = () => {
        console.log('decreace');
        if (this.state.ballSpeed > 100) {
            this.decreaseBtn += 1;

            //this.cancelAnimation();

            this.setState(prevState => ({
                ballSpeed: prevState.ballSpeed - 100,
            }));
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

    startGame = (e) => {

        this.cigaretteSong.volume = 0.2;
        this.cigaretteSong.loop = true;



        console.log(e.target);
        e.target.style.display = 'none';
        this.interval = setInterval(() => this.tick(), 1000);

        this.setState(prevState => ({
            countdown: {
                ...prevState.countdown,
                show: true,
            },
        }));

        console.log(this.state);

        document.addEventListener('keydown', (e) => {

            console.log(e.keyCode);

            if (e.keyCode === 87 || e.keyCode === 38) {
                this.increaseSpeed();
            }

            if (e.keyCode === 83 || e.keyCode === 40) {
                this.decreaseSpeed();
            }

        }, false);
    }

    cancelAnimation = () => {

        window.cancelAnimationFrame(this.requestframeref);
        console.log('CANCELLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL FUNC');

        // console.log(this.requestframeref);
        // if (this.requestframeref) {
        //     //console.log('CANCELLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL FUNC');
        //     //console.log(window.cancelAnimationFrame(this.requestframeref));
        //
        //     console.log('I\'m deleting id: ', this.requestframeref);
        //     window.cancelAnimationFrame(this.requestframeref);
        //     this.canceledRequests += 1;
        // }
    }

    pauseMusic = () => {

    }

    playMusic = () => {

        if (this.cigaretteSong.paused) {
            this.cigaretteSong.play();
        }else{
            this.cigaretteSong.pause();
        }
    }


    render() {
        const {
            paddle,
            ball,
        } = this.gameParams;

        console.log('render');
        // console.log(this.gameParams.brickNodes);
        // console.log(this.gameParams);
        // console.log(this.state);
        // console.log(bricks);

        const ballStyle = {
            width: ball.diam,
            height: ball.diam,
        };

        const paddleStyle = {
            width: paddle.width,
            height: paddle.height,
        };

        return (
            <div className="game-container">
                {!this.state.showField &&
                    <button onClick={this.startGame}>
                        play
                    </button>
                }

                {this.state.countdown.show &&
                    <div style={{color: 'white'}}>
                        {this.state.countdown.sec}
                    </div>
                }
                <button style={{cursor: 'pointer'}} onClick={this.cancelAnimation}>cancel animation</button>
                <button style={{cursor: 'pointer'}} onClick={this.playMusic}>mute</button>
                {
                    this.state.showField &&
                    //1 &&
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

                        <div ref={(paddle) => {this.gameParams.paddleNode = paddle}} style={paddleStyle} id="paddle" />
                        <div ref={(ball) => {this.gameParams.ballNode = ball}} style={ballStyle} id="ball" />
                        <div ref={(livesNode) => {this.gameParams.livesNode = livesNode}} id="livesNode">3</div>
                        <div ref={(scoreNode) => {this.gameParams.scoreNode = scoreNode}} id="scoreNode">0</div>
                        <div style={{color: 'white'}} id="scoreNode">
                            {this.state.ballSpeed}
                        </div>

                    </div>
                }
                <audio ref={(elem) => {this.cigaretteSong = elem}} id="justAcigarette">
                    <source src="media/princess-chelsea-the-cigarette-duet.mp3" type="audio/mpeg"/>
                </audio>

            </div>
        );
    }
}


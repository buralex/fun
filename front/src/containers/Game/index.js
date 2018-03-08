import React, { PureComponent, Fragment } from 'react';


import debounce from "lodash/debounce";

import './style.css';

import bricks from './bricks';
import {playList} from '../../utils/data/playList';

//import bricks from './b1';


// calc game height depending on screen height
const calcHeight = (height) => {
    let h = 700;

    if (height < 600) {
        h = 500;
    } else if (height < 750) {
        h = 600;
    }
    return h;
};

export default class Game extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            // each ball it's another '1'
            ballsArr: [1],
            ballSpeed: 300,
            resetKey: 0,
            showField: false,
            winning: false,
            //screenHeight: props.screenDims.height,
            countdown: {
                sec: 3,
                show: false,
            },
        };

        this.brokenBricks = 0;

        const fieldHeight = calcHeight(Math.max( document.documentElement.clientHeight, window.innerHeight ));

        // animation mutates gameParams object, changing coordinates of the ball
        this.gameParams = {
            // width and height are equal
            width: fieldHeight,
            height: fieldHeight,
            lives: 100,
            score: 0,
            paddingBottom: 30,
            dt: 1 / 50, // 50fps

            balls: [],

            paddle: {
                x:0,
                y:0,
                width: fieldHeight / 5,
                height: fieldHeight / 50,
                last_x: 0,
                speed: 300,
            },

            fieldNode: null,
            paddleNode: null,
            brickNodes: [],
            ballNodes: [],
        }

        this.brickParams = {
            width: fieldHeight / bricks[0].length,
            height: fieldHeight / bricks[0].length,
        };

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
    }

    componentDidMount() {
        this.startGame();
    }

    componentDidUpdate() {
        if (this.gameParams.fieldNode
            && this.gameParams.ballNodes) {

            this.cancelAnimation();

            const gp = this.gameParams;

            this.initParams(gp);
            this.handlePaddleMovement(gp);
            this.draw(gp);
        }

        if (this.canvas) {
            this.ctx = this.canvas.getContext("2d");
            console.log(this.ctx);
            // this.drawBricks();
            // this.drawPaddle();
            // this.drawBall();
        }
    }

    drawBall = () => {
        const { ctx, canvas } = this;
        const { balls } = this.gameParams;

        balls.forEach((ball, i) => {
            //this.calcMovementAndCollisions(width, height, brickNodes, ball, ballNodes, paddle, dt);


            ctx.beginPath();
            ctx.arc(ball.x, ball.y, this.ballParams.radius, 0, Math.PI*2);
            ctx.fillStyle = "#0095DD";
            ctx.fill();
            ctx.closePath();
        });


    }

    drawPaddle = () => {
        const { ctx, canvas } = this;
        const { x, height, width } = this.gameParams.paddle;

        //console.log(canvas.height);
        ctx.beginPath();
        ctx.rect(x, canvas.height - height, width, height);
        ctx.fillStyle = "#0095DD";
        ctx.fill();
        ctx.closePath();
    }

    drawBricks = () => {
        const { ctx } = this;
        const { height, width } = this.brickParams;
        const brickColumnCount = bricks[0].length;
        const brickRowCount = bricks.length;

        // console.log(brickColumnCount);
        // console.log(brickRowCount);

        //var brickPadding = 10;
        //var brickOffsetTop = 30;
        //var brickOffsetLeft = 30;

        bricks.forEach((row, i) => {
            row.forEach((col, k) => {
                if(bricks[i][k] === 1) {
                    var brickX = (k*(width));
                    var brickY = (i*(height));
                    //bricks[c][r].x = brickX;
                    //bricks[c][r].y = brickY;


                    ctx.beginPath();
                    // console.log(brickHeight);
                    // console.log(brickWidth);
                    ctx.rect(brickX, brickY, width, height);
                    ctx.fillStyle = "green";
                    //ctx.stroke();
                    ctx.fill();
                    ctx.closePath();
                    if (i == 35) {
                        //debugger
                    }

                }
            });

        })

        // for(let c=0; c < brickColumnCount; c++) {
        //     for(let r=0; r < brickRowCount; r++) {
        //         console.log(c);
        //         console.log(r);
        //         console.log(bricks[c]);
        //         console.log(bricks[c][r]);
        //         if(/*bricks[c][r] === 1*/ 1) {
        //             var brickX = (r*(brickWidth+brickPadding))+brickOffsetLeft;
        //             var brickY = (c*(brickHeight+brickPadding))+brickOffsetTop;
        //             //bricks[c][r].x = brickX;
        //             //bricks[c][r].y = brickY;
        //
        //
        //             ctx.beginPath();
        //             console.log(brickHeight);
        //             console.log(brickWidth);
        //             ctx.rect(brickX, brickY, brickWidth, brickHeight);
        //             ctx.fillStyle = "green";
        //             ctx.stroke();
        //             ctx.fill();
        //             ctx.closePath();
        //             if (r == 35) {
        //                 debugger
        //             }
        //
        //         }
        //     }
        // }

        // bricks.map((row, i) => {
        //     return row.forEach((col, k) => {
        //         return (
        //             <div
        //                 style={brickStyle}
        //                 key={i+k}
        //                 brickrow={`${i}`}
        //                 brickcol={`${k}`}
        //                 className={`${col === 0 ? 'cell': 'brick'}`}
        //             />
        //         );
        //     });
        //
        // })

        // for(c=0; c<brickColumnCount; c++) {
        //     for(r=0; r<brickRowCount; r++) {
        //         if(bricks[c][r].status == 1) {
        //             var brickX = (r*(brickWidth+brickPadding))+brickOffsetLeft;
        //             var brickY = (c*(brickHeight+brickPadding))+brickOffsetTop;
        //             bricks[c][r].x = brickX;
        //             bricks[c][r].y = brickY;
        //             ctx.beginPath();
        //             ctx.rect(brickX, brickY, brickWidth, brickHeight);
        //             ctx.fillStyle = "#0095DD";
        //             ctx.fill();
        //             ctx.closePath();
        //         }
        //     }
        // }
    }

    // Return a random number in between x and y
    random(x, y) {
        return x + (Math.random() * (y - x));
    }

    // Return a suitable start angle
    getThetaStartAngle = () => {
        return this.random((-1 / 6) * Math.PI, (-5 / 6) * Math.PI);  //from -150 to -30 degrees
    }

    initParams = ({width, height, paddle, balls, paddingBottom, paddleNode}) => {
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

        //paddleNode.style.left = `${paddle.x}px`;
        //paddleNode.style.top = `${paddle.y}px`;

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

            //paddleNode.style.left = `${paddle.x}px`;
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
            this.reflectBallFromTop(ball);
        }

        // Check for collisions with the bottom
        if (ball.y >= height - ball.diam) {
            this.reflectBallFromBottom(ball);
        }


        /*------------------------------------------------
            check for collisions with the paddle
        --------------------------------------------------*/
        const brickWidth = this.brickParams.width;
        const brickHeight = this.brickParams.height;

        let correctionDims = ball.radius;

        if (this.state.ballSpeed > 300 && this.state.ballSpeed <= 400) {
            correctionDims = ball.radius + (ball.radius / 2);
        } else if (this.state.ballSpeed > 500) {
            correctionDims = ball.diam;
        }

        let paddleCollision = this.rectangleIntersect(
            paddle.x + (paddle.width / 2), paddle.y + (paddle.height / 2), paddle.width, paddle.height,
            ball.x + ball.radius, ball.y + correctionDims, ball.diam, ball.diam
        );

        if (paddleCollision) {
            if (this.isBallReflectingFromPaddle) {
                // we have a collision but ball is already reflecting from the paddle so ignore it
            } else {
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

        const frame = (time) => {
            /*---------------------------------------------------------------------
                    ball movement
            * -------------------------------------------------------------------*/

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawBricks();
            this.drawPaddle();
            this.drawBall();


            balls.forEach((ball, i) => {
                this.calcMovementAndCollisions(width, height, brickNodes, ball, ballNodes, paddle, dt);


                if (ballNodes[i]) {
                    ballNodes[i].style.left = `${ball.x}px`;
                    ballNodes[i].style.top = `${ball.y}px`;
                }
            });


            if (this.brokenBricks < this.visibleBricksCount) {
                this.requestframeref = window.requestAnimationFrame(frame);

            } else {
                this.cancelAnimation();
                this.winTheGame();
            }
        }

        window.requestAnimationFrame(frame);
    }

    playWinningVideo = (vid) => {
        if (vid) {
            vid.loop = true;
            vid.play();
            this.playMusic();
        }
    }

    playMusic = () => {
        this.mute.classList.toggle('on');

        if (this.audioNode.paused) {
            this.audioNode.play();
        }else{
            this.audioNode.pause();
        }
    }


    increaseSpeed = () => {

        if (this.state.ballSpeed < 600) {
            this.setState(prevState => ({
                ballSpeed: prevState.ballSpeed + 100,
            }));
        }
    }

    decreaseSpeed = () => {

        if (this.state.ballSpeed > 100) {
            this.setState(prevState => ({
                ballSpeed: prevState.ballSpeed - 100,
            }));
        }
    }

    increaseBalls = () => {
        this.setState(prevState => ({
            ballsArr: [...prevState.ballsArr, 1],
        }));
    }

    decreaseBalls = () => {
        if (this.state.ballsArr.length > 1) {
            const newArr = this.state.ballsArr.slice(0, -1);

            this.setState(prevState => ({
                ballsArr: newArr,
            }));
        }
    }

    tick() {
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
            this.setState(prevState => ({
                countdown: {
                    ...prevState.countdown,
                    sec: prevState.countdown.sec - 1,
                },
            }));
        }
    }

    startGame = () => {

        //this.greeting.style.display = 'none';

        this.audioNode.volume = 0.2;
        this.audioNode.loop = true;

        this.interval = setInterval(() => this.tick(), 1000);

        this.setState(prevState => ({
            countdown: {
                ...prevState.countdown,
                show: true,
            },
        }));
    }

    winTheGame = () => {
        this.setState(prevState => ({
            winning: true,
        }));

        this.playMusic();
        this.audioNode.src = playList.winSong;
        this.playMusic();

        this.gameParams.fieldNode.style.outline = 'none';
    }

    cancelAnimation = () => {
        window.cancelAnimationFrame(this.requestframeref);
    }

    reset = () => {
        this.setState(prevState => ({
            resetKey: prevState.resetKey + 1,
            winning: false,
        }));
    }

    render() {
        const {
            paddle,
            width,
            height,
        } = this.gameParams;

        const fieldStyle = {
            width: width,
            height: height,
        };

        const canvasStyle = {
            //width: width,
            //height: height,
            background: 'white',
            zIndex: '10'
        };

        const brickStyle = {
            width: width / bricks[0].length,
            height: height / bricks[0].length,
        };

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

                        <div className="navbar-item">
                            <button
                                className="button"
                                onClick={this.props.reset}
                            >
                                reset
                            </button>
                        </div>

                    </div>
                }

                {this.state.countdown.show &&
                    <div className="countdown">
                        {this.state.countdown.sec}
                    </div>
                }

                {this.state.winning &&
                    <div className="win-head">
                        <h3>Well done! You've spent a few minutes without smoking :)</h3>
                    </div>
                }

                {this.state.showField &&
                    <Fragment>
                        <canvas
                            width={width}
                            height={height}
                            style={canvasStyle}
                            ref={(c) => {this.canvas = c}}
                            id="fieldCanvas"
                        />

                        <div className="field-wrap">


                            <div
                                ref={(field) => {
                                    if (field) {
                                        this.gameParams.brickNodes = field.children;
                                        this.gameParams.fieldNode = field;
                                    }
                                }}
                                key={this.state.resetKey}
                                id="field"
                                style={fieldStyle}
                            >

                                /*--------------------------------------------------------
                                    bricks
                                ----------------------------------------------------------*/
                                {
                                //     bricks.map((row, i) => {
                                //     return row.map((col, k) => {
                                //         return (
                                //             <div
                                //                 style={brickStyle}
                                //                 key={i+k}
                                //                 brickrow={`${i}`}
                                //                 brickcol={`${k}`}
                                //                 className={`${col === 0 ? 'cell': 'brick'}`}
                                //             />
                                //         );
                                //     });
                                //
                                // })

                                }
                                /*--------------------------------------------------------
                                    balls
                                ----------------------------------------------------------*/
                                {
                                //     !this.state.winning && this.state.ballsArr.map((b, i) => {
                                //     return(
                                //         <div
                                //             key={`key${i+1}`}
                                //             ref={(ball) => {this.gameParams.ballNodes[i] = ball}}
                                //             ballkey={i}
                                //             style={ballStyle}
                                //             id="ball"
                                //         />
                                //     );
                                // })

                                }

                                {/*<div ref={(paddle) => {this.gameParams.paddleNode = paddle}} style={paddleStyle} id="paddle" />*/}

                                {this.state.winning &&
                                <Fragment>
                                    <video ref={this.playWinningVideo} className="win-video">
                                        <source src="media/lazy_dance.mp4" type="video/mp4" />
                                    </video>
                                </Fragment>
                                }
                            </div>
                        </div>
                    </Fragment>
                }
                <audio
                    ref={(elem) => {this.audioNode = elem}}
                    id="justAcigarette"
                    src={playList.bgSong}
                />
            </div>
        );
    }
}


import React, { Component } from 'react';

import './style.css';

import bricks from './bricks';

class Game extends Component {

    constructor(props) {
        super(props);

        console.log(this.paddleNode);

        this.gameParams = {
            // // css position of paddle
            // px: 128,
            //
            // // offset ball per cycle (px)
            // dx: -2,
            // dy: -2,
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
                //  theta is the angle the ball direction makes with the x axis. from -PI to PI, -PI/2 is vertically up, PI/2 is verticall down
                theta: (-1 * Math.PI) / 2,
                last_x: 0,
                last_y: 0,
                speed: 200,
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

        //this.isBallReflectingFromPaddle = false;

        this.state = {
            speed: 1,
            needsRefresh: false,
        };

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

        const gp = this.gameParams;

        this.initParams(gp);

        this.handlePaddleMovement(gp);

        this.draw(gp);

    }

    componentDidUpdate() {
        console.log('update');
        window.cancelAnimationFrame(this.requestframeref);

        const gp = this.gameParams;

        this.initParams(gp);

        this.draw(gp);
    }

    handlePaddleMovement = ({paddle, paddleNode, width, fieldNode}) => {

        document.addEventListener('mousemove', (e) => {
            //px = (e.pageX > 40) ? ((e.pageX < 290) ? e.pageX - 40 : 256) : 0;
            //paddle.style.left = px + 'px';

            //let percentageScreen = parseInt(e.pageX*100/document.documentElement.clientWidth);
            let pageX = parseInt(e.pageX)
            let fieldLeftBound = fieldNode.getBoundingClientRect().x;

            if (pageX < fieldLeftBound) {
                paddle.x = 0;
            } else if ((pageX + paddle.width) > (fieldLeftBound + width)) {
                paddle.x = width - paddle.width;

                // console.log('cursorX: ',pageX);
                // console.log('real cursor + paddle width: ', (pageX + paddle.width));
                // console.log('boundary: ', (fieldLeftBound + width));
            } else {
                paddle.x = pageX - fieldLeftBound;
            }

            paddleNode.style.left = `${paddle.x}px`;

            // console.log(paddle.offsetWidth);

            //paddleNode.style.left = `${percentageScreen}%`;


        }, false);

        // document.addEventListener('mousemove', (e) => {
        //
        //     //  Keep the paddle in bounds
        //     // if (paddle.x < 0 + (paddle.width / 2)) {
        //     //     paddle.x = 0 + (paddle.width / 2);
        //     // }
        //     // if (this.paddle.x > game.gameBounds.right - (this.paddle.width / 2)) {
        //     //     this.paddle.x = game.gameBounds.right - (this.paddle.width / 2);
        //     // }
        //
        //     //console.log(e.pageX);
        //     //console.log(window.innerWidth);
        //
        //     //paddle.x = e.pageX;
        //
        //     // // Keep the paddle in bounds
        //     // if (e.pageX < 0 + (paddle.width / 2)) {
        //     //     paddle.x = 0 + (paddle.width / 2);
        //     // }
        //     // if (this.paddle.x > game.gameBounds.right - (this.paddle.width / 2)) {
        //     //     this.paddle.x = game.gameBounds.right - (this.paddle.width / 2);
        //     // }
        //
        //     // paddle.x = (e.pageX > 40) ? ((e.pageX < 480) ? e.pageX - 40 : 439) : 0;
        //     paddleNode.style.left = `${paddle.x}px`;
        // }, false);
    }

    initParams = ({width, height, paddle, ball, paddingBottom, paddleNode}) => {

        paddle.x = width / 2;
        paddle.y = height - paddle.height - paddingBottom;

        ball.x = paddle.x;
        ball.y = paddle.y - paddle.height / 2;

        console.log(paddleNode);
        console.log(paddleNode);

        paddleNode.style.top = `${paddle.y}px`;

        // this.gameBounds = {
        //     left: width / 2 - this.config.gameWidth / 2,
        //     right: width / 2 + this.config.gameWidth / 2,
        //     top: height / 2 - this.config.gameHeight / 2,
        //     bottom: height / 2 + this.config.gameHeight / 2,
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
//debugger
        if (p1_x < p2_x + width2 &&
            p1_x + width1 > p2_x &&
            p1_y < p2_y + height2 &&
            height1 + p1_y > p2_y) {
            console.log('INTERSECT------------------->>>>>>>');
            return true;
        }
        return false;
    }

    draw = ({ width, height, brickNodes, ball, ballNode, paddle, paddleNode, lives, dt }) => {

        // Set a random start direction for the ball
        ball.theta = this.getThetaStartAngle();

        console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');

        const frame = (time) => {
            //console.log(ball);

            /*---------------------------------------------------------------------
                    ball movement
            * -------------------------------------------------------------------*/
            //console.log('tic ', ball.x);

            // Move the ball
            ball.last_x = ball.x;
            ball.last_y = ball.y;


            //console.log(ball);
            //debugger

            ball.x += dt * ball.speed * Math.cos(ball.theta);
            ball.y += dt * ball.speed * Math.sin(ball.theta);

            ballNode.style.left = `${ball.x}px`;
            ballNode.style.top = `${ball.y}px`;
            // console.log(ballNode.style);
            // console.log(ballNode.style);

            // Check for collisions with the bounds and paddle
            if (ball.x <= 0) {
                this.reflectBallFromLeft(ball);
            }

            if (ball.x >= width - ball.radius * 2) {
                this.reflectBallFromRight(ball);
            }

            if (ball.y <= 0) {
                //game.sounds.playSound('pong');
                this.reflectBallFromTop(ball);
            }

            // Check for collisions with the bottom
            if (ball.y >= height - ball.radius * 2) {
                //this.looseLife();

                this.reflectBallFromBottom(ball);
            }

            // Check for collisions with the paddle
            let ballWidth = ball.radius * 2;

            let paddleCollision = this.rectangleIntersect(
                paddle.x + (paddle.width / 2), paddle.y + (paddle.height / 2), paddle.width, paddle.height,
                ball.x, ball.y, ballWidth, ballWidth
            );

            if (paddleCollision) {
                if (this.isBallReflectingFromPaddle) {
                    // we have a collision but ball is already reflecting from the paddle so ignore it
                } else {
                    //.sounds.playSound('pong');
                    this.isBallReflectingFromPaddle = true;
                    this.reflectBallFromPaddle(ball, paddle);
                }
            } else {
                this.isBallReflectingFromPaddle = false;
            }

            // if (time > 1000) {
            //     window.cancelAnimationFrame(_this.requestframeref);
            // }

            /*---------------------------------------------------------------------
                    end ball movement
            * -------------------------------------------------------------------*/

            this.requestframeref = window.requestAnimationFrame(frame);
        }

        window.requestAnimationFrame(frame);
    }


    increaseSpeed = () => {
        console.log('increase');
        this.gameParams.dx -= 5;
        this.gameParams.dy -= 5;

        this.setState(prevState => ({
            speed: Math.abs(this.gameParams.dx),
        }));
    }

    decreaseSpeed = () => {
        console.log('decreace');
        this.gameParams.dx += 5;
        this.gameParams.dy += 5;

        this.setState(prevState => ({
            speed: Math.abs(this.gameParams.dx),
        }));
    }


    render() {
        const {
            paddle,
            ball,
        } = this.gameParams;

        console.log('render');
        console.log(this.gameParams.brickNodes);
        console.log(this.gameParams);
        console.log(this.state);
        console.log(bricks);

        const ballStyle = {
            width: ball.radius * 2,
            height: ball.radius * 2,
        };

        const paddleStyle = {
            width: paddle.width,
            height: paddle.height,
        };

        return (
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
                            <div key={i+k} row={`${i}`} col={`${k}`} className={`${col === 0 ? 'cell': 'brick'}`}/>
                        );
                    });


                })

                }

                <div ref={(paddle) => {this.gameParams.paddleNode = paddle}} style={paddleStyle} id="paddle"/>
                <div ref={(ball) => {this.gameParams.ballNode = ball}} style={ballStyle} id="ball" />
                <div ref={(livesNode) => {this.gameParams.livesNode = livesNode}} id="livesNode">3</div>
                <div ref={(scoreNode) => {this.gameParams.scoreNode = scoreNode}} id="scoreNode">0</div>

                {/*<button onClick={this.increaseSpeed}>increase</button>*/}
                {/*<button onClick={this.decreaseSpeed}>decrease</button>*/}
            </div>
        );
    }
}

export default Game;

import React, { Component } from 'react';

import './style.css';

import bricks from './bricks';

class Game extends Component {

    constructor(props) {
        super(props);

        this.gameParams = {
            // // css position of paddle
            // px: 128,
            //
            // // offset ball per cycle (px)
            // dx: -2,
            // dy: -2,
            width: 500,
            height: 500,
            lives: 100,
            score: 0,

            // initial positioning
            ball: {
                x: 0,
                y: 0,
                radius: 5,
                //  theta is the angle the ball direction makes with the x axis. from -PI to PI, -PI/2 is vertically up, PI/2 is verticall down
                theta: (-1 * Math.PI) / 2,
                last_x: 0,
                last_y: 0,
            },
            paddle: {
                x:0,
                y:0,
                width: 60,
                height: 16,
                last_x: 0,
                speed: 500,
            },

            // elements (DOM nodes)
            brickNodes: this.brickNodes,
            ballNode: null,
            livesNode: null,
            scoreNode: null,
            paddleNode: null,
        };

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

        this.draw(gp);

        document.addEventListener('mousemove', (e) => {
            gp.paddle.x = (e.pageX > 40) ? ((e.pageX < 480) ? e.pageX - 40 : 439) : 0;
            gp.paddleNode.style.left = gp.paddle.x + 'px';
        }, false);
    }

    componentDidUpdate() {
        console.log('update m');
        window.cancelAnimationFrame(this.requestframeref);

        const gp = this.gameParams;

        this.initParams(gp);

        this.draw(gp);
    }

    initParams = ({width, height, paddle, ball}) => {

        paddle.x = width / 2;
        paddle.y = height - paddle.height;

        ball.x = paddle.x;
        ball.y = paddle.y - paddle.height / 2;
    }

    draw = ({ dx, dy, px, brickNodes, ball, paddle, lives, ballNode,}) => {

        let _this = this;

        console.log(dx);
        console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');

        window.requestAnimationFrame(function step(time) {

        /*---------------------------------------------------------------------
                ball movement
        * -------------------------------------------------------------------*/

            ballNode.style.left = `${ball.x}px`;
            console.log(ballNode.style);
            console.log(ballNode.style);

            //debugger

            //_this.requestframeref = window.requestAnimationFrame(step);

        /*---------------------------------------------------------------------
                end ball movement
        * -------------------------------------------------------------------*/

            // /*---------------------------------------------------------------------
            //        ball movement
            // * -------------------------------------------------------------------*/
            // const bx = parseFloat(ball.style.left = `${parseFloat(ball.style.left) + dx}px`);
            // //console.log(bx);
            // const by = parseFloat(ball.style.top = `${parseFloat(ball.style.top) + dy}px`);
            //
            // // on which row the ball is located
            // const row = Math.ceil((parseInt(by) + 5) / 10) - 1;
            // //const row = ballX / 50 | 0;
            //
            // // on which col the ball is located
            // const col = Math.ceil((parseInt(bx) + 5) / 10) - 1;
            //
            // // bounce from left or right wall
            // if (bx < 0 && dx < 0 || bx >= 490 && dx > 0) {
            //     //debugger
            //     dx *= -1;
            // }
            //
            //
            // // bounce from top
            // if (by < 0) {
            //     dy *= -1;
            // }
            //
            // // bounce from bottom
            // if (by >= 490 && lives) { dy *= -1; }
            //
            // let cell;
            //
            // if (brickNodes[row * 50 + col] !== undefined) {
            //     cell = brickNodes[row * 50 + col];
            // }
            //
            // // bounce from paddle
            // if (bx + 6 >= px && bx + 6 <= px + 64 && by >= 460 && by <= 480) {
            //
            //     dy *= -1;
            //     if (bx + 6 <= px + 21) dx = -6;
            //     else if (bx + 6 >= px + 43) dx = 6;
            //     else if (Math.abs(dx) === 6) dx = (dx * 2 / 3) | 0;
            // }
            //
            // // removing bricks
            // if (cell && cell.classList.contains('brick') && !cell.classList.contains('removed')) {
            //
            //     dy *= -1;
            //
            //     cell.classList.add('removed');
            //
            //     // changes direction only if ball hits left or right part of brick
            //     if (dx < 0 && ((bx | 0) % 10 < 4 || (bx | 0) % 10 > 6)) {dx *= -1;}
            //     if (dx > 0 && (((bx + 12) | 0) % 10 < 4 || ((bx + 12) | 0) % 10 > 6)) {dx *= -1;}
            // }
            //
            // _this.requestframeref = window.requestAnimationFrame(step);
            //
            // // if (time > 1000) {
            // //     window.cancelAnimationFrame(_this.requestframeref);
            // // }
            // /*---------------------------------------------------------------------
            //        end ball movement
            // * -------------------------------------------------------------------*/


        });
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

        console.log('render');
        console.log(this.gameParams.brickNodes);
        console.log(this.gameParams);
        console.log(this.state);
        console.log(bricks);

        return (
            <div
                ref={(field) => {
                    if (field) {
                        console.log(field); this.gameParams.brickNodes = field.children
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

                <div ref={(paddle) => {this.gameParams.paddleNode = paddle}} id="paddle"/>
                <div ref={(ball) => {this.gameParams.ballNode = ball}} id="ball" />
                <div ref={(livesNode) => {this.gameParams.livesNode = livesNode}} id="livesNode">3</div>
                <div ref={(scoreNode) => {this.gameParams.scoreNode = scoreNode}} id="scoreNode">0</div>

                <button onClick={this.increaseSpeed}>increase</button>
                <button onClick={this.decreaseSpeed}>decrease</button>
            </div>
        );
    }
}

export default Game;

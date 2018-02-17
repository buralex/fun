import React, { PureComponent } from 'react';

//import './style.css';

// import bricks from './bricks';
//import bricks from './b1';

export default class NightSky extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            ballSpeed: 300,
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
        this.skyLogic();
    }

    componentDidUpdate() {
        console.log('update');
    }

    skyLogic = () => {
        (function() {
            const requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function( callback ){
                    window.setTimeout(callback, 1000 / 60);
                };
            window.requestAnimationFrame = requestAnimationFrame;
        })();

        const background = document.getElementById("bgCanvas");
        const bgCtx = background.getContext("2d");
        const width = document.body.clientWidth;
        const height = document.body.clientHeight;

        background.width = width;
        background.height = height;

        // Some random points
        var points = [],
            displacement = 140,
            power = Math.pow(2,Math.ceil(Math.log(width)/(Math.log(2))));

        // set the start height and end height for the terrain
        points[0] = (height - (Math.random()*height/2))-displacement;
        points[power] = (height - (Math.random()*height/2))-displacement;

        // create the rest of the points
        for(let i = 1; i<power; i*=2){
            for(let j = (power/i)/2; j <power; j+=power/i){
                points[j] = ((points[j - (power/i)/2] + points[j + (power/i)/2]) / 2) + Math.floor(Math.random()*-displacement+displacement );
            }
            displacement *= 0.6;
        }

        // Second canvas used for the stars
        bgCtx.fillStyle = '#000';
        bgCtx.fillRect(0,0,width,height);

        // stars
        function Star(options){
            this.size = Math.random()*2;
            this.speed = Math.random()*.05;
            this.x = options.x;
            this.y = options.y;
        }

        Star.prototype.reset = function(){
            this.size = Math.random()*2;
            this.speed = Math.random()*.05;
            this.x = width;
            this.y = Math.random()*height;
        }

        Star.prototype.update = function(){
            this.y+=this.speed;
            if(this.x<0){
                this.reset();
            }else{
                bgCtx.fillRect(this.x,this.y,this.size,this.size);
            }
        }

        var entities = [];

        // init the stars
        for(let i=0; i < height; i++){
            entities.push(new Star({x:Math.random()*width, y:Math.random()*height}));
        }

        //animate background
        function animate(){
            bgCtx.fillStyle = '#000';
            bgCtx.fillRect(0,0,width,height);
            bgCtx.fillStyle = '#ffffff';
            bgCtx.strokeStyle = '#ffffff';

            let entLen = entities.length;

            while(entLen--){
                entities[entLen].update();
            }

            requestAnimationFrame(animate);
        }
        animate();
    }


    render() {
        // const {
        //     paddle,
        //     ball,
        // } = this.gameParams;


        return (
            <div>
                <canvas id="bgCanvas"/>
            </div>
        );
    }
}

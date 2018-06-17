import React, { Component } from 'react';

import 'normalize.css';
import './css/index.css';

import Game from '../containers/Game';
import NightSky from '../containers/Game/components/NightSky';
import debounce from "lodash/debounce";

class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            screenDims: {
                width: Math.max( document.documentElement.clientWidth, window.innerWidth ),
                height: Math.max( document.documentElement.clientHeight, window.innerHeight ),
            },
            showGame: false,
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

    componentDidMount () {
        window.addEventListener("resize", debounce(this.resizeHandler, 1000));
    }

    startGame = () => {
        if (!this.gameStarted) {
            this.gameStarted = true;

            this.setState(prevState => ({
                showGame: true,
            }))
        }
    }


    resizeHandler = () => {

        this.setState(prevState => ({
            screenDims: {
                ...prevState.screenDims,
                width: Math.max( document.documentElement.clientWidth, window.innerWidth ),
                height: Math.max( document.documentElement.clientHeight, window.innerHeight ),
            },
        }))
    }

    reset = () => {
        this.gameStarted = false;

        this.setState(prevState => ({
            showGame: false,
        }))
    }

    render() {
        return (
            <div className="App">
                <div className="wrapper">
                    {!this.state.showGame &&
                        <button className="button-start" onClick={this.startGame}>
                            start
                        </button>
                    }
                    {this.state.showGame &&
                        <Game
                            reset={this.reset}
                        />
                    }

                    <NightSky screenDims={this.state.screenDims}/>
                </div>
            </div>
        );
    }
}

export default App;

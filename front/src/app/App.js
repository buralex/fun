import React, { Component } from 'react';

import 'normalize.css';
import './index.css';


import Game from '../containers/Game';
import NightSky from '../containers/Game/components/NightSky';

class App extends Component {
  render() {
    return (
      <div className="App">
          <div className="wrapper">
              <Game/>
              <NightSky/>
          </div>
      </div>
    );
  }
}

export default App;

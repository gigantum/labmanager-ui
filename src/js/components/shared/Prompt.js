import React, { Component } from 'react'
import GigantumCyanPNG from 'Images/logos/gigantum-cyan.png'
import GigantumCLI from 'Images/logos/cli.png'

const pingServer = () => {
  return fetch(window.location.protocol + '//' + window.location.hostname + `${process.env.GIGANTUM_API}`, {
    'method': 'OPTIONS'
  }).then(response => {
    return true;
  }).catch(error => {
    return false;
  });
}

export default class Prompt extends Component {
  constructor(props) {
    super(props);

    this.state = {
      failureCount: 0,
      connected: false,
      promptState: true
    };
    this._handlePing = this._handlePing.bind(this);
  }

  componentWillMount() {
    this._handlePing();
    this.intervalId = setInterval(this._handlePing.bind(this), 2500);
  }

  _handlePing = () => {
    pingServer()
      .then((response) => {
        if (response) {
          if (this.state.failureCount > 0) window.location.reload();
          this.setState({ promptState: true, connected: true, failureCount: 0 });
          clearInterval(this.intervalId);
          this.intervalId = setInterval(this._handlePing.bind(this), 10000);
        } else {
          if (this.state.connected) window.location.reload();
          this.setState({ failureCount: this.state.failureCount + 1, promptState: false });
          clearInterval(this.intervalId);
          this.intervalId = setInterval(this._handlePing.bind(this), 2500);
        }
      });
  }


  render() {
    return (
      <div className="Prompt">
        <div className={this.state.promptState ? "hidden" : "Prompt__info"}>
          <img
            alt="gigantum"
            className={this.state.failureCount >= 2 ? this.state.failureCount >= 8 ? "Prompt__logo--final" : "Prompt__logo--raised" : "Prompt__logo"}
            src={GigantumCyanPNG}
          >
          </img>
          <div className={this.state.failureCount >= 2 && this.state.failureCount < 8 ? "Prompt__loading-text" : "hidden"}>
            Loading Please Wait...
          </div>
          <div className={this.state.failureCount >= 8 ? "Prompt__failure-container" : "hidden"}>
            <div className="Prompt__failure-text">
              <p>Looks like something is wrong.</p>
              <p>Are you sure gigantum is running?</p>
              <p>Use the 'gigantum start' command to run the application.</p>
            </div>
            <img
                alt="cli"
                className="Prompt__cli"
                src={GigantumCLI}
            />
          </div>
        </div>
      </div>
    )
  }
}

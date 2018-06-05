import React, { Component } from 'react'
import Sniffr from 'sniffr'

const pingServer = () => {
  const url = `${window.location.protocol}//${window.location.hostname}${process.env.PING_API}`;
  return fetch(url, {
    'method': 'GET'
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

  /**
    @param {}
    pings server and checks when the api comes back up
  */
  _handlePing = () => {
    pingServer()
      .then((response) => {
        if (response) {
          if (this.state.failureCount > 0) window.location.reload();
          this.setState({ promptState: true, connected: true, failureCount: 0 });
          clearInterval(this.intervalId);
          this.intervalId = setInterval(this._handlePing.bind(this), 10000);
        } else {

          this.setState({ failureCount: this.state.failureCount + 1, promptState: false });
          clearInterval(this.intervalId);
          this.intervalId = setInterval(this._handlePing.bind(this), 2500);
        }
      });
  }


  render() {
    let s = new Sniffr();
    s.sniff(navigator.userAgent)
    let os = s.os.name;
    return (
      <div className="Prompt">
        <div className={this.state.promptState ? "hidden" : "Prompt__info"}>
          <div
            className={this.state.failureCount >= 2 ? this.state.failureCount >= 8 ? "Prompt__logo--final" : "Prompt__logo--raised" : "Prompt__logo"}
          >
          </div>
          <div className={this.state.failureCount >= 2 && this.state.failureCount < 8 ? "Prompt__loading-text" : "hidden"}>
            Loading Please Wait...
          </div>
          <div className={this.state.failureCount >= 8 ? "Prompt__failure-container" : "hidden"}>
            <div className="Prompt__failure-text">
              <p>There was a problem loading Gigantum</p>
              <p>Ensure Gigantum is running or restart the application</p>
            </div>
            {
              os === 'macos' &&
              <div
                className="Prompt__mac">
              </div>
            }
            {
              os === 'windows' &&
              <div
                className="Prompt__windows">
              </div>
            }
            {
              os === 'linux' &&
              <div
                className="Prompt__cli">
              </div>
            }
          </div>
        </div>
      </div>
    )
  }
}

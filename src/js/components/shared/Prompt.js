import React, { Component } from 'react'
import uuidv4 from 'uuid/v4'

const pingServer = () => {
  let apiHost = process.env.NODE_ENV === 'development' ? 'localhost:10000' : window.location.host
  const url = `${window.location.protocol}//${apiHost}${process.env.PING_API}?v=${uuidv4()}`;
  return fetch(url, {
    'method': 'GET'
  }).then(response => {
    if(response.status === 200 && (response.headers.get('content-type') === 'application/json')){
      return true;
    }
    return false;
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

  UNSAFE_componentWillMount() {
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
              {
                window.location.hostname === 'localhost' ?
                <div>
                  <p>Ensure Gigantum is running or restart the application</p>
                  <p>If the problem continues to persist, follow the steps <a href="https://docs.gigantum.com/docs/client-interface-fails-to-load"  rel="noopener noreferrer" target="_blank">here</a>.</p>

                </div>
                :
                <div>
                  <p>Please ensure you have a valid internet connection.</p>
                  <p>If the problem continues to persist, please report it <a href="https://docs.gigantum.com/discuss"  rel="noopener noreferrer" target="_blank">here</a>.</p>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}

// vendor
import React, { Component } from 'react';
// components
import Modal from 'Components/shared/Modal';
// auth
import Auth from 'JS/Auth/Auth';
// assets
import './LoginPrompt.scss';


const auth = new Auth();

export default class LoginPrompt extends Component {
  _login() {
    auth.login();
    this.props.closeModal(true);
  }

  _dontLogin() {
    this.props.closeModal(true);
  }

  render() {
    return (
      <Modal
        size="small"
        handleClose={() => this.props.closeModal()}
        renderContent={() =>
          (navigator.onLine ?
            <div className="LoginPrompt">
              <div>
                <p>Your authentication token has expired and must be renewed to perform this action.</p>
                <p>Do you want login?</p>
              </div>
              <div className="LoginPrompt__buttonContainer">
                <button onClick={() => { this._login(); }}>Yes</button>
                <button onClick={() => { this._dontLogin(); }}>no</button>
              </div>
            </div>
          :
            <div className="LoginPrompt">
              <div>
                <p>A valid internet connection is required to perform this action.</p>
              </div>
            </div>)
        }
      />
    );
  }
}

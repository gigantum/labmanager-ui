import React, { Component } from 'react'

import Dashboard from '../dashboard/Dashboard';
import Login from '../login/Login';

export default class Home extends Component {
  //login for Auth0 function
  login() {
    this.props.auth.login();
  }
  render() {
    const { isAuthenticated } = this.props.auth;

    return (
      <div className="Home">
        {
          isAuthenticated() && (
            <Dashboard
              match={this.props.match}
              history={this.props.history}
            />
          )
        }
        {
          !isAuthenticated() && (
              <Login auth={this.props.auth}/>
            )
        }

    </div>
    )
  }
}

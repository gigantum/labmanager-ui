import React, { Component } from 'react'

import DatasetsLabbooksContainer from '../datasetsLabbooks/DatasetsLabbooksContainer';
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
        <div className="Home">
          {
            isAuthenticated() && (
              <DatasetsLabbooksContainer
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
    </div>
    )
  }
}

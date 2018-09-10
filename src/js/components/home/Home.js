import React, { Component } from 'react'
import Dashboard from 'Components/dashboard/Dashboard';
import Login from 'Components/login/Login';

export default class Home extends Component {
  //login for Auth0 function
  constructor(props){
    super(props)

    this.footerWorkerCallback = this.footerWorkerCallback.bind(this)
  }
  login() {
    this.props.auth.login();
  }

  footerWorkerCallback(worker, filepath){
    this.props.footerWorkerCallback(worker, filepath);
  }
  render() {
    const { isAuthenticated } = this.props.auth;
    const { forceLoginScreen, loadingRenew } = this.props;

    return (
      <div className="Home">
        {
          isAuthenticated() && !forceLoginScreen && (
            <Dashboard
              auth={this.props.auth}
              footerWorkerCallback={this.footerWorkerCallback}
              match={this.props.match}
              history={this.props.history}
            />
          )
        }

        {
          (!isAuthenticated() || forceLoginScreen) && (
              <Login
                auth={this.props.auth}
                forceLoginScreen={forceLoginScreen}
                loadingRenew={loadingRenew}
              />
            )
        }

    </div>
    )
  }
}

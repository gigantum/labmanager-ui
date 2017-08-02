import React, { Component } from 'react'
import {
  QueryRenderer,
  graphql
} from 'react-relay'
import environment from '../../createRelayEnvironment'

import DatasetsLabbooksContainer from '../datasetsLabbooks/DatasetsLabbooksContainer';

export default class Home extends Component {
  //login for Auth0 function
  login() {
    this.props.auth.login();
  }
  render() {
    const { isAuthenticated } = this.props.auth;

    return (
      <div>
        <div>
          {
            isAuthenticated() && (
              <DatasetsLabbooksContainer match={this.props.match} history={this.props.history} environment={environment}/>
            )
          }
          {
            !isAuthenticated() && (
                <h4>
                  You are not logged in! Please{' '}
                  <a
                    style={{ cursor: 'pointer' }}
                    onClick={this.login.bind(this)}
                  >
                    Log In
                  </a>
                  {' '}to continue.
                </h4>
              )
          }
        </div>
    </div>
    )
  }
}

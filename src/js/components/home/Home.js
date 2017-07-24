import React, { Component } from 'react'
import {
  QueryRenderer,
  graphql
} from 'react-relay'
import environment from '../../createRelayEnvironment'

import DatasetsLabbooksContainer from '../datasetsLabbooks/DatasetsLabbooksContainer';



export default class Home extends Component {

  login() {
    this.props.auth.login();
  }
  render() {
    console.log(this)
    const { isAuthenticated } = this.props.auth;
    console.log(isAuthenticated())
    return (
      <div>
      <div>
        {
        isAuthenticated() && (
          <DatasetsLabbooksContainer history={this.props.history} environment={environment}/>
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

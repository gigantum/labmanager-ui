import React, { Component } from 'react'
import {
  QueryRenderer,
  graphql
} from 'react-relay'
import environment from '../../createRelayEnvironment'

import DatasetsLabbooksContainer from '../datasetsLabbooks/DatasetsLabbooksContainer';
//import ListPage from './ListPage'

const LabbookQuery = graphql`query HomeQuery($first: Int!){localLabbooks(first:$first){edges{node{name}}}}`


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
        <QueryRenderer
          environment={environment}
          query={LabbookQuery}
          variables={{
            first: 4
          }}
          render={({error, props}) => {
            console.log(props)
            if (error) {
              return <div>{error.message}</div>
            } else if (props) {
              return <div></div>
            }
            return <div>Loading</div>
          }}
        />)
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
      <DatasetsLabbooksContainer />
    </div>
    )
  }
}

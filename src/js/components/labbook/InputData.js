import React, { Component } from 'react'
// import {
//   createFragmentContainer,
//   QueryRenderer,
//   graphql
// } from 'react-relay'
//import environment from '../../../createRelayEnvironment'
//import CreateLabbook from './CreateLabbook'


export default class InputData extends Component {
  constructor(props){
  	super(props);
  }

  render(){
    console.log(this.props)
    return(
        <div className="input-data__container">
          input data
        </div>
      )
  }
}

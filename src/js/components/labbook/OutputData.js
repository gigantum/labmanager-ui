import React, { Component } from 'react'
// import {
//   createFragmentContainer,
//   QueryRenderer,
//   graphql
// } from 'react-relay'
//import environment from '../../../createRelayEnvironment'
//import CreateLabbook from './CreateLabbook'


export default class OutputData extends Component {
  constructor(props){
  	super(props);
  }

  render(){
    console.log(this.props)
    return(
        <div className="output-data__container">

        </div>
      )
  }
}

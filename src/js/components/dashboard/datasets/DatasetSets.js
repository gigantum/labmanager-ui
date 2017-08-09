import React, { Component } from 'react'
import {
  QueryRenderer,
  graphql
} from 'react-relay'
import environment from '../../../createRelayEnvironment'



export default class DatasetSets extends Component {

  render(){
    return(
      <div className="Datasets">
        <h1>Datasets</h1>
      </div>
    )
  }
}

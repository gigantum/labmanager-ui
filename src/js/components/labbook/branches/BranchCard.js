//vendor
import React, { Component } from 'react'

export default class BranchCard extends Component {
  constructor(props){

  	super(props);
  }
  render(){

    return(
      <div className="BranchCard card">
        <h6>{this.props.edge.node.name}</h6>
      </div>
    )
  }
}

import React, { Component } from 'react'

export default class Environment extends Component {
  constructor(props){
  	super(props);
  }

  render(){
    console.log(this.props)
    return(
        <div className="Environment">

        </div>
      )
  }
}

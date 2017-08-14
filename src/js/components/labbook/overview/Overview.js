import React, { Component } from 'react'

export default class Overview extends Component {
  constructor(props){
  	super(props);
  }

  render(){
    console.log(this.props)
    return(
        <div className="Overview">
          input data
        </div>
      )
  }
}

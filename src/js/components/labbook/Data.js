import React, { Component } from 'react'

export default class Data extends Component {
  constructor(props){
  	super(props);
  }

  render(){
    console.log(this.props)
    return(
        <div className="Data">
          input data
        </div>
      )
  }
}

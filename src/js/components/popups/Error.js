import React, { Component } from 'react'

export default class Error extends Component {
  constructor(props){
  	super(props);
    this.state = {
      'visible': false,
      'message': ''
    }
  }


  _open(message){
    this.setState({
      'visible': true,
      'message': message
    })
  }

  _close(){
    this.setState({
      'visible': true,
      'message': ''
    })
  } 

  render(){

    return(
        <div className={this.state.visible ? 'hidden' : 'Error'}>
            {this.state.message}
        </div>
      )
  }
}

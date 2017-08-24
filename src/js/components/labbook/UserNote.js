import React, { Component } from 'react'
import SimpleMDE from 'simplemde'

export default class UserNote extends React.Component {
  constructor(props){
  	super(props);
    this.state = {showExtraInfo: false}
  }
  componentDidMount() {
    var simple = new SimpleMDE({ element: document.getElementById("markDown") });
  }

  render(){
    return(
      <div className="UserNote">
        <textarea id="markDown"></textarea>
        <button> Add Note</button>
      </div>
    )
  }
}

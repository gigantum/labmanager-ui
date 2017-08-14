// import 'es6-promise';
import React, { Component } from 'react'
import StartContainerMutation from './../../../mutations/StartContainerMutation'

export default class Code extends Component {
  constructor(props){
  	super(props);
  }

  _openJupyter(){

    StartContainerMutation(
      this.props.labbookName,
      'default',
      'clientMutationId',
      (response) =>{
          setTimeout(function(){
                window.open('http://localhost:8888/tree', '_blank')
          }, 1000)

      }
    )


  }

  render(){

    return(
        <div id="code" className="Code flex flex-row justify-center">
          <button className="" onClick={() => this._openJupyter()}
          target="_blank">
            Open Jupyter
          </button>
        </div>
      )
  }
}

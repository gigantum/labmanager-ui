// import 'es6-promise';
import React, { Component } from 'react'
import StartContainerMutation from 'Mutations/StartContainerMutation'

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
          }, 3000)

      }
    )


  }

  render(){

    return(
        <div id="code" className="Code flex flex-row justify-center">
          <button className="Code__open-jupyter" onClick={() => this._openJupyter()}
          target="_blank">
            Open Jupyter
          </button>
        </div>
      )
  }
}

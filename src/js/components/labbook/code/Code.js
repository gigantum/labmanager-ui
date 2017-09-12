// vendor
import React, { Component } from 'react'
import SweetAlert from 'sweetalert-react';
//mutations
import StartContainerMutation from 'Mutations/StartContainerMutation'

let code;
export default class Code extends Component {
  constructor(props){
  	super(props);

    this.state = {
      'show': false,
      'message': ''
    }

    code = this;
  }

  _openJupyter(){

    StartContainerMutation(
      this.props.labbookName,
      'default',
      'clientMutationId',
      (error) =>{
        if(error){
          code.setState({
            'show': true,
            'message': error[0].message,
          })
        }else{
            window.open('http://localhost:8888/', '_blank')
        }


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

          <SweetAlert
            className="sa-error-container"
            show={this.state.show}
            type="error"
            title="Error"
            text={this.state.message}
            onConfirm={() => {
              this.setState({ show: false, message: ''})
            }}
            />
        </div>
      )
  }
}

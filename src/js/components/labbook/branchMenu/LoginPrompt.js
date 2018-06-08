//vendor
import React, { Component } from 'react'
//components
import Modal from 'Components/shared/Modal'
//auth
import Auth from 'JS/Auth/Auth';
const auth = new Auth()

export default class LoginPrompt extends Component {

  _login(){
    auth.login()
    this.props.closeModal(true)
  }

  _dontLogin(){
    this.props.closeModal(true)
  }

  render(){

    return(
      <Modal
        size="small"
        handleClose={()=> this.props.closeModal()}
        renderContent={()=>
          <div className="LoginPrompt">
            <div>
              <p>You need an active session to perform this action</p>
              <p>Do you want login?</p>
            </div>
            <div className="LoginPrompt__button-container">
              <button onClick={()=>{this._login()}}>Yes</button>
              <button onClick={()=>{this._dontLogin()}}>no</button>
            </div>
          </div>
        }
      />
    )

  }
}

//vendor
import React, { Component } from 'react'
//Mutations
import DeleteLabbookMutation from 'Mutations/DeleteLabbookMutation'
//store
import store from 'JS/redux/store'

export default class DeleteLabbook extends Component {
  constructor(props){
  	super(props);
  	this.state = {
      'labbookName': ''
    };
  }
  /**
    @param {object} evt
    sets state of labbookName
  */
  _setLabbookName(evt){
    this.setState({labbookName: evt.target.value})
  }
  /**
    @param {}
    sets state of labbookName
  */
  _deleteLabbook(){
    const {labbookName, owner} = store.getState().routes
    if(labbookName === this.state.labbookName){
      DeleteLabbookMutation(
        labbookName,
        owner,
        true,
        (response, error)=>{
          if(error){
            store.dispatch({
              'type': "ERROR_MESSAGE",
              'payload': {
                'message': `The was a problem deleteing ${labbookName}`,
                'messageList': error
              }
            })
          }else{
            store.dispatch({
              'type': "INFOR_MESSAGE",
              'payload': {
                'message': `${labbookName} has been deleted`
              }
            })

            this.props.history.replace('../../labbooks/')


          }
        }

      )
    }else{
      store.dispatch({
        'type': "WARNING_MESSAGE",
        'payload': {
          'message': `Names do not match`
        }
      })
    }
  }

  _getExplanationText(){
    const {labbookName, owner} = store.getState().routes
    if(this.props.remoteAdded){
      return(
      <div>
        <p>This will delete <b>{labbookName}</b> from this gigantum client.</p>
        <p>You can still download it from repo.gigantum.io/{owner}/{labbookName}.</p>
      </div>)
    }else{
      return(<p>This will delete <b>{labbookName}</b> from this gignatum instance. All data will be removed and can not be recovered.</p>)
    }
  }

  render(){
    const {labbookName} = store.getState().routes
    return(
      <div className="DeleteLabbook">
        <h4 className="DeleteLabbook__header">Delete Labbook</h4>
        {this._getExplanationText()}
        <input
          placeholder={`Enter ${labbookName} to delete`}
          onKeyUp={(evt)=>{this._setLabbookName(evt)}}
          type="text"
        />

        <button onClick={()=> this._deleteLabbook()}>Delete Labbook</button>
      </div>
    )
  }
}

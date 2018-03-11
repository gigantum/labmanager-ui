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

  render(){
    console.log(this.props.history)
    return(
      <div className="DeleteLabbook">
        <h5 className="DeleteLabbook__header">Delete Labbook</h5>
        <hr />
        <p>Enter Labbook Name to delete</p>
        <input
          onKeyUp={(evt)=>{this._setLabbookName(evt)}}
          type="text"
        />

        <button onClick={()=> this._deleteLabbook()}>Delete Labbook</button>
      </div>
    )
  }
}

import React from 'react'
import { QueryRenderer, graphql } from 'react-relay'

import CreateLabbookMutation from '../../../mutations/CreateLabbookMutation'

// const CreatePageViewerQuery = graphql`
//   query CreateLabbookQuery {
//     viewer {
//       id
//     }
//   }
// `;

export default class CreateLabbook extends React.Component {
  constructor(props){
  	super(props.props);
  	this.state = {
      'modal_visible': false,
      'name': '',
      'description': ''
    };
  }
  _createLabbook(evt){
    let viewerId = 'calum';
    CreateLabbookMutation(this.state.description, this.state.name, viewerId,  () => this.props.history.replace(`/home`))
    this._hideModal();
    this.props.handler(evt);
  }
  /*
    evt:object, field:string - updates text in a state object and passes object to setState method
  */
  _updateTextState(evt, field){
    let state = {}
    state[field] = evt.target.value;
    this.setState(state)
  }

  _showModal(){
    this.setState({'modal_visible': true})
  }

  _hideModal(){
    this.setState({'modal_visible': false})
  }

  render(){

    return(
        <div className='create-labbook__container'>
            <div className={!this.state.modal_visible ? 'create-labbook__modal hidden' : 'create-labbook__modal'}>
              <div className='create-labbook__modal-inner-container flex flex-column justify--space-around'>
                <div className='create-labbook__modal-close' onClick={() => this._hideModal()}>X</div>
                <div>
                  <label>Name</label><input type='text' onChange={(evt) => this._updateTextState(evt, 'name')}></input>
                </div>
                <div>
                  <label>Description</label><input type='text' onChange={(evt) => this._updateTextState(evt, 'description')}></input>
                </div>
                <div>
                  <button className='pa3 bg-black-10 bn dim ttu pointer' onClick={(x, evt) => this._createLabbook(evt)}>
                  Create Labbook</button>
                </div>
              </div>
            </div>

            <button className='pa3 bg-black-10 bn dim ttu pointer' onClick={() => this._showModal()}>Create Labbook</button>
        </div>
      )
  }
}

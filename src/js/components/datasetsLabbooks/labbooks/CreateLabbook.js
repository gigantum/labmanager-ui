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
  	super(props);
  	this.state = {
      'modal_visible': false,
      'name': '',
      'description': ''
    };
  }
  _createLabbook(evt){
    let viewerId = 'localLabbooks';//Todo: figure out what to do with viewerId in the mutation context
    let name = this.state.name;

    //create new labbook
    CreateLabbookMutation(
      this.state.description,
      name,
      viewerId,
      () => this.props.history.replace(`/labbooks/${name}`) //route to new labbok on callback
    )

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
    document.getElementById('modal__cover').classList.remove('hidden')
  }

  _hideModal(){
    this.setState({'modal_visible': false})
    document.getElementById('modal__cover').classList.add('hidden')
  }

  render(){

    return(
        <div className="CreateLabbook">
            <div className={!this.state.modal_visible ? 'CreateLabbook__modal hidden' : 'CreateLabbook__modal'}>
              <div className='CreateLabbook__modal-inner-container flex flex-column justify--space-around'>

                <div
                  className="CreateLabbook__modal-close"
                  onClick={() => this._hideModal()}>
                  X
                </div>

                <div>
                  <label>Name</label>
                  <input
                    type='text'
                    onChange={(evt) => this._updateTextState(evt, 'name')}
                  />
                </div>

                <div>
                  <label>Description</label>
                  <input
                    type="text"
                    onChange={(evt) => this._updateTextState(evt, 'description')}
                  />
                </div>

                <div>
                  <button
                    className="CreateLabbook__button"
                    onClick={(x, evt) => this._createLabbook(evt)}
                  >
                    Create Labbook
                  </button>
                </div>

              </div>
            </div>

            <button
              className="CreateLabbook__button CreateLabbook__button--margin"
              onClick={() => this._showModal()}
            >
              Create Labbook
            </button>
        </div>
      )
  }
}

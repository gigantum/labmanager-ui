import React from 'react'

import CreateLabbook from './CreateLabbook'

// const CreatePageViewerQuery = graphql`
//   query CreateLabbookQuery {
//     viewer {
//       id
//     }
//   }
// `;

export default class WizardModal extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {
      'modal_visible': false,
      'name': '',
      'description': ''
    };
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
        <div className="WizardModal">
            <div className={!this.state.modal_visible ? 'WizardModal__modal hidden' : 'WizardModal__modal'}>
              <CreateLabbook />

            </div>

            <button
              className="CreateLabbook__button CreateLabbook__button--margin"
              onClick={() => this._showModal()}>
              Create Labbook
            </button>
        </div>
      )
  }
}

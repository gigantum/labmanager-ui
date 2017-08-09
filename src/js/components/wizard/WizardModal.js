import React from 'react'

import CreateLabbook from './CreateLabbook'
import SelectBaseImage from './SelectBaseImage'

// const CreatePageViewerQuery = graphql`
//   query CreateLabbookQuery {
//     viewer {
//       id
//     }
//   }
// `;


let that;
export default class WizardModal extends React.Component {
  constructor(props){
  	super(props);
    let state = this.state;

  	this.state = {
      'component': <CreateLabbook setComponent={this._setComponent} nextWindow={'selectBaseImage'} />,//<SelectBaseImage setComponent={this._setComponent}  nextWindow={'installDependencies'} />,
      'selectedComponentId': 'createLabook',
      'name': '',
      'description': '',
      'modalNav': [
        {"id": "createLabook", "component": <CreateLabbook setComponent={this._setComponent} nextWindow={'selectBaseImage'}/>, 'selected': true},
        {"id": "selectBaseImage", "component": <SelectBaseImage setComponent={this._setComponent}  nextWindow={'installDependencies'}/>, 'selected': false},
        {"id": "installDependencies", "component": <CreateLabbook setComponent={this._setComponent} nextWindow={'installDependencies'}/>, 'selected': false}
      ]
    };
    that = this;
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

  _setComponent(navItemId){
    console.log(navItemId, that)
    let navItem = that.state.modalNav.filter((nav) => {
      return (nav.id === navItemId)
    })[0]
    that.setState({'component': navItem.component})
    that.setState({"selectedComponentId": navItem.id})
  }

  render(){

    return(
        <div className="WizardModal">
            <div id='modal__cover' className={!this.state.modal_visible ? 'WizardModal__modal hidden' : 'WizardModal__modal'}>
              <div className="WizardModal__progress">
                <ul className="WizardModal__progress-bar">
                  {
                    this.state.modalNav.map((navItem) => {
                      return (<li key={navItem.id} onClick={() => this._setComponent(navItem.id)} className={(navItem.id === this.state.selectedComponentId) ? 'WizardModal__progress-item selected' : 'WizardModal__progress-item' }></li>)
                    })
                  }


                </ul>
              </div>
              <div
                className="WizardModal__modal-close"
                onClick={() => this._hideModal()}>
                X
              </div>

              {this.state.component}

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

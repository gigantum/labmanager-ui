import React from 'react'

import CreateLabbook from './CreateLabbook'
import SelectBaseImage from './SelectBaseImage'
import SelectDevelopmentEnvironment from './SelectDevelopmentEnvironment'
import ImportCode from './ImportCode'
import SuccessMessage from './SuccessMessage'
import AddEnvironmentPackage from './AddEnvironmentPackage'
import AddDatasets from './AddDatasets'
import AddCustomDependencies from './AddCustomDependencies'


let that = {state: {}};
export default class WizardModal extends React.Component {
  constructor(props){
  	super(props);

  	this.state = {
      'selectedComponentId': 'createLabook',
      'name': '',
      'labbookName': '',
      'baseImage': null,
      'description': '',
      'modalNav': [
        {'id': 'createLabook', 'description': 'Title & Description'},
        {'id': 'selectBaseImage', 'description': 'Base Image'},
        {'id': 'selectDevelopmentEnvironment', 'description': 'Dev Environment'},
        {'id': 'addEnvironmentPackage', 'description': 'Add Dependencies'},
        {'id': 'addCustomDependencies', 'description': 'Custom Dependencies'},
        {'id': 'addDatasets', 'description': 'Datasets'},
        {'id': 'importCode', 'description': 'Import Code'},
        {'id': 'successMessage', 'description': 'Success'}
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
  /*
    function()
    shows modal window
  */

  _showModal(){
    this.setState({'modal_visible': true})
    document.getElementById('modal__cover').classList.remove('hidden')
  }
  /*
    function()
    hides modal window
  */
  _hideModal(){
    this.setState({'modal_visible': false})
    document.getElementById('modal__cover').classList.add('hidden')
  }

  /*
    function()
    sets view for components
  */

  _setComponent(navItemId){
    let navItem = that.state.modalNav.filter((nav) => {
      return (nav.id === navItemId)
    })[0]

    that.setState({"selectedComponentId": navItem.id})

  }
  /*
    function()
    sets labbookName for mini session
  */
  _setLabbookName(labbookName){
    that.setState({'labbookName': labbookName})
  }
  /*
    function()
    sets baseimage object for mini session
  */
  _setBaseImage(baseImage){
    that.setState({'baseImage': baseImage})
  }

  /*
    function()
    gets id of current selected component for view navigation
  */
  _getSelectedComponentId(){
    return this.state.selectedComponentId
  }

  render(){

    return(
        <div className="WizardModal">
            <div id='modal__cover' className={!this.state.modal_visible ? 'WizardModal__modal hidden' : 'WizardModal__modal'}>

              <div className="WizardModal__progress">
                <ul className="WizardModal__progress-bar">
                  {
                    this.state.modalNav.map((navItem) => {
                      return (<li key={navItem.id} className={(navItem.id === this.state.selectedComponentId) ? 'WizardModal__progress-item selected' : 'WizardModal__progress-item' }>{(navItem.id === this.state.selectedComponentId) ? navItem.description : ''}</li>)
                    })
                  }


                </ul>
              </div>
              <h4 className="WizardModal__title">Create a Lab Book</h4>
              <div
                className="WizardModal__modal-close"
                onClick={() => this._hideModal()}>
                X
              </div>
              {
                (this._getSelectedComponentId() === 'createLabook') && (
                  <CreateLabbook setComponent={this._setComponent} setLabbookName={this._setLabbookName} nextWindow={'selectBaseImage'}/>
                )
              }

              {

                (this._getSelectedComponentId()  === 'selectBaseImage') && (
                  <SelectBaseImage labbookName={that.state.labbookName} setBaseImage={this._setBaseImage} setComponent={this._setComponent}  nextWindow={'selectDevelopmentEnvironment'}/>
                )
              }

              {

                ( this._getSelectedComponentId()  === 'selectDevelopmentEnvironment') && (

                  <SelectDevelopmentEnvironment  labbookName={that.state.labbookName} setComponent={this._setComponent} nextWindow={'addEnvironmentPackage'}/>
                )
              }
              {

                ( this._getSelectedComponentId()  === 'addEnvironmentPackage') && (

                  <AddEnvironmentPackage baseImage={this.state.baseImage} availablePackageManagers={this.state.baseImage.node.availablePackageManagers}  labbookName={that.state.labbookName} setComponent={this._setComponent} nextWindow={'addCustomDependencies'}/>
                )
              }

              {

                ( this._getSelectedComponentId()  === 'addCustomDependencies') && (

                  <AddCustomDependencies setComponent={this._setComponent} nextWindow={'addDatasets'} labbookName={that.state.labbookName}/>
                )
              }

              {

                ( this._getSelectedComponentId()  === 'addDatasets') && (

                  <AddDatasets setComponent={this._setComponent} nextWindow={'importCode'} labbookName={that.state.labbookName}/>
                )
              }

              {

                ( this._getSelectedComponentId()  === 'importCode') && (

                  <ImportCode
                    setComponent={this._setComponent}
                    nextWindow={'successMessage'}
                    labbookName={that.state.labbookName}
                  />
                )
              }

              {

                ( this._getSelectedComponentId()  === 'successMessage') && (

                  <SuccessMessage
                    labbookName={that.state.labbookName}
                    history={this.props.history}
                  />
                )
              }

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

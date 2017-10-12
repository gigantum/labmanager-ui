//vendor
import React from 'react'
//components
import CreateLabbook from './CreateLabbook'
import SelectBaseImage from './SelectBaseImage'
import SelectDevelopmentEnvironment from './SelectDevelopmentEnvironment'
import SuccessMessage from './SuccessMessage'
import AddEnvironmentPackage from './AddEnvironmentPackage'
import AddCustomDependencies from './AddCustomDependencies'


let wizard = {state: {}};
export default class WizardModal extends React.Component {
  constructor(props){
  	super(props);

  	this.state = {
      'selectedComponentId': 'createLabook',
      'nextComponentId': 'selectBaseImage',
      'previousComponentId': null,
      'name': '',
      'labbookName': '',
      'baseImage': null,
      'description': '',
      'continueDisabled': true,
      'modalNav': [
        {'id': 'createLabook', 'description': 'Title & Description'},
        {'id': 'selectBaseImage', 'description': 'Base Image'},
        {'id': 'selectDevelopmentEnvironment', 'description': 'Dev Environment'},
        {'id': 'addEnvironmentPackage', 'description': 'Add Dependencies'},
        {'id': 'addCustomDependencies', 'description': 'Custom Dependencies'},
        {'id': 'successMessage', 'description': 'Success'}
      ]
    };
    wizard = this;
  }
  /**
    @param {Object, string} evt,field
    updates text in a state object and passes object to setState method
  */
  _updateTextState(evt, field){
    let state = {}
    state[field] = evt.target.value;
    this.setState(state)
  }

  /**
    @param {}
    shows modal window by update component state
  */
  _showModal(){
    this.setState({
      'modal_visible': true,
      'selectedComponentId': 'createLabook',
      'nextComponentId': 'selectBaseImage',
      'previousComponent': null
    })
    if(document.getElementById('modal__cover')){
      document.getElementById('modal__cover').classList.remove('hidden')
    }
  }
  /**
    @param {}
    hides modal window by update component state
  */
  _hideModal(){
    this.setState({'modal_visible': false})
    if(document.getElementById('modal__cover')){
      document.getElementById('modal__cover').classList.add('hidden')
    }
  }
  /**
    @param {string} id
    sets view for child components using and id
  */
  _setComponent(navItemId){

    let index = 0;
    let navItem = wizard.state.modalNav.filter((nav, i) => {
      index = (nav.id === navItemId) ? i : index;
      return (nav.id === navItemId)
    })[0]

    wizard.setState({"selectedComponentId": navItem.id})

    if((index + 1) < wizard.state.modalNav.length){
      wizard.setState({"nextComponentId": wizard.state.modalNav[index + 1].id})
    }

    if(index > 0){
      wizard.setState({"previousComponentId": wizard.state.modalNav[index - 1].id})
    }

  }
  /**
    @param {string} labbookName
    sets labbookName for mini session
  */
  _setLabbookName(labbookName){
    wizard.setState({'labbookName': labbookName})
  }

  /**
    @param {Object} baseImage
    sets baseimage object for mini session
  */
  _setBaseImage(baseImage){
    wizard.setState({'baseImage': baseImage})
  }

  /**
    @param {}
    gets id of current selected component for view navigation
    @return {string} selectedComponentId
  */
  _getSelectedComponentId(){
    return this.state.selectedComponentId
  }

  /**
    @param {boolean} isDisabled
    setsContinueDisabled value to true or false
  */
  _toggleDisabledContinue(isDisabled){
    wizard.setState({
      'continueDisabled': isDisabled
    })
  }

  /**
    @param {}
    gets selected id and triggers continueSave function using refs
  */
  _continueSave(){
    this.refs[this._getSelectedComponentId()].continueSave()
  }
  /**
    @param {}
    gets button text for current componenet
    @return {string} text
  */
  _getButtonText(){
    let text = (this.state.selectedComponentId === 'successMessage') ? 'Done' : 'Save and Continue Setup'
    text = (this.state.selectedComponentId === 'importCode') ? 'Complete' : text;

    return text;
  }

  render(){

    return(
        <div className="WizardModal">
            <div className={!this.state.modal_visible ? 'WizardModal__modal hidden' : 'WizardModal__modal'}>

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
                  <CreateLabbook
                    ref="createLabook"
                    toggleDisabledContinue={this._toggleDisabledContinue}
                    setComponent={this._setComponent}
                    setLabbookName={this._setLabbookName}
                    nextWindow={'selectBaseImage'}/>
                )
              }

              {

                (this._getSelectedComponentId()  === 'selectBaseImage') && (
                  <SelectBaseImage
                    ref="selectBaseImage"
                    toggleDisabledContinue={this._toggleDisabledContinue}
                    labbookName={wizard.state.labbookName}
                    setBaseImage={this._setBaseImage}
                    setComponent={this._setComponent}
                    nextWindow={'selectDevelopmentEnvironment'}/>
                )
              }

              {

                ( this._getSelectedComponentId()  === 'selectDevelopmentEnvironment') && (

                  <SelectDevelopmentEnvironment
                    ref="selectDevelopmentEnvironment"
                    toggleDisabledContinue={this._toggleDisabledContinue}
                    labbookName={wizard.state.labbookName}
                    setComponent={this._setComponent}
                    nextWindow={'addEnvironmentPackage'}/>
                )
              }
              {

                ( this._getSelectedComponentId()  === 'addEnvironmentPackage') && (

                  <AddEnvironmentPackage
                    ref="addEnvironmentPackage"
                    baseImage={this.state.baseImage}
                    toggleDisabledContinue={this._toggleDisabledContinue} availablePackageManagers={this.state.baseImage.node.availablePackageManagers}  labbookName={wizard.state.labbookName}
                    setComponent={this._setComponent}
                    nextWindow={'addCustomDependencies'}/>
                )
              }

              {

                ( this._getSelectedComponentId()  === 'addCustomDependencies') && (

                  <AddCustomDependencies
                    ref="addCustomDependencies"
                    toggleDisabledContinue={this._toggleDisabledContinue}
                    setComponent={this._setComponent}
                    nextWindow={'successMessage'}
                    labbookName={wizard.state.labbookName}/>
                )
              }

              {

                ( this._getSelectedComponentId()  === 'successMessage') && (

                  <SuccessMessage
                    ref="successMessage"
                    toggleDisabledContinue={this._toggleDisabledContinue}
                    labbookName={wizard.state.labbookName}
                    history={this.props.history}
                  />
                )
              }

            <div className="flex flex--row justify--center">

              <button disabled={this.state.previousComponentId === null} onClick={() => this._setComponent(this.state.previousComponentId)} className={(this.state.selectedComponentId === 'successMessage') ? 'hidden' : 'WizardModal__progress-button flat--button'}>
                Previous
              </button>
              <button
                onClick={() => this._hideModal()}
                className={(this.state.selectedComponentId === 'successMessage') ? 'hidden' : 'WizardModal__progress-button flat--button'}>
                Cancel
              </button>
              <button
                disabled={this._getSelectedComponentId() === 'createLabook'}
                onClick={() => this._setComponent(this.state.nextComponentId)}
                className={(this.state.selectedComponentId === 'successMessage') ? 'hidden' : 'WizardModal__progress-button flat--button'}>
                skip
              </button>
              <button
                onClick={()=> this._continueSave()}
                disabled={(this.state.continueDisabled)}
                >
                  {
                    this._getButtonText()
                  }
              </button>

            </div>

          </div>

        </div>
      )
  }
}

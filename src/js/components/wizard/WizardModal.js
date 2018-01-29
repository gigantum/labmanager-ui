//vendor
import React from 'react'
import { CSSTransitionGroup } from 'react-transition-group'
//components
import CreateLabbook from './CreateLabbook'
import SelectBase from './SelectBase'
//mutations
import CreateLabbookMutation from 'Mutations/CreateLabbookMutation'

import Config from 'JS/config'


export default class WizardModal extends React.Component {
  constructor(props){
  	super(props);

  	this.state = {
      'name': '',
      'description': '',
      'repository': '',
      'componentId': '',
      'revision': '',
      'selectedComponentId': 'selectBase',
      'nextComponentId': 'selectBase',
      'previousComponentId': null,
      'continueDisabled': true,

    };

    this._createLabbookCallback = this._createLabbookCallback.bind(this)
    this._createLabbookMutation = this._createLabbookMutation.bind(this)
    this._selectBaseCallback = this._selectBaseCallback.bind(this)
    this._continueSave = this._continueSave.bind(this)
    this._setComponent = this._setComponent.bind(this)
    this._showModal = this._showModal.bind(this)
    this._hideModal = this._hideModal.bind(this)
    this._updateTextState = this._updateTextState.bind(this)
    this._setLabbookName = this._setLabbookName.bind(this)
    this._getSelectedComponentId = this._getSelectedComponentId.bind(this)
    this._toggleDisabledContinue = this._toggleDisabledContinue.bind(this)
  }
  /**
    @param {Object, string} evt,field
    updates text in a state object and passes object to setState method
  */
  _updateTextState = (evt, field) =>{
    let state = {}
    state[field] = evt.target.value;
    this.setState(state)
  }

  /**
    @param {}
    shows modal window by update component state
  */
  _showModal = () => {
    this.setState({
      'modal_visible': true,
      'selectedComponentId': 'selectBase',
      'nextComponentId': 'selectBase',
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
  _hideModal = () => {
    this.setState({'modal_visible': false})
    if(document.getElementById('modal__cover')){
      document.getElementById('modal__cover').classList.add('hidden')
    }
  }
  /**
    @param {string} componentId
    sets view for child components using and id
  */
  _setComponent = (componentId) => {

    this.setState({'selectedComponentId': componentId})

  }
  /**
    @param {string} labbookName
    sets labbookName for mini session
  */
  _setLabbookName = (labbookName) => {
    this.setState({'labbookName': labbookName})
  }

  /**
    @param {Object} base
    sets baseimage object for mini session
  */
  _setBase = (base) => {
    this.setState({'base': base})
  }

  /**
    @param {}
    gets id of current selected component for view navigation
    @return {string} selectedComponentId
  */
  _getSelectedComponentId = () => {
    return this.state.selectedComponentId
  }

  /**
    @param {boolean} isDisabled
    setsContinueDisabled value to true or false
  */
  _toggleDisabledContinue = (isDisabled) => {
    this.setState({
      'continueDisabled': isDisabled
    })
  }

  /**
    @param { boolean} isSkip
    gets selected id and triggers continueSave function using refs
  */
  _continueSave = (isSkip) =>{

    this.refs[this._getSelectedComponentId()].continueSave(isSkip)

    this.setState({'continueDisabled': true})
  }
  /**
    @param {string ,string} name,description
    sets name and description to state for create labbook mutation
  */
  _createLabbookCallback(name, description){
    this.setState({
      name,
      description
    })

    this._setComponent('selectBase')
  }
  /**
    @param {string, string ,Int} repository, componentId revision
    sets (repository, componentId and revision to state for create labbook mutation
  */
  _selectBaseCallback(node){
    console.log(node)
    const {repository, componentId, revision} = node
    console.log(repository, componentId, revision)
    this.setState({
      repository: repository,
      componentId: componentId,
      revision: revision
    })
    console.log(this.state)
    //this._creatLabbookMutation();
  }
  /**
      @param {}
      sets name and description to state for create labbook mutation
  */
  _createLabbookMutation(){
    let self = this;
    const {
      name,
      description,
      repository,
      componentId,
      revision
    } = this.state

    CreateLabbookMutation(
      name,
      description,
      repository,
      componentId,
      revision,
      (response, error) => {
        console.log(response, error);
        if(error){

        }else{
          const {owner, name} = response.createLabbook.labbook
          self.props.history.push(`../labbooks/${owner}/${name}`)
        }
      }
    )
  }

  render(){

    return(
        <div className="WizardModal">
          { this.state.modal_visible &&

              <div className={'WizardModal__modal'}>

                <div
                  className="WizardModal__modal-close"
                  onClick={() => this._hideModal()}>
                </div>

                {this._currentComponent()}

                <ModalNav
                  state={this.state}
                  getSelectedComponentId={this._getSelectedComponentId}
                  setComponent={this._setComponent}
                  hideModal={this._hideModal}
                  getButtonText={this._getButtonText}
                  continueSave={this._continueSave}
                  createLabbookCallback={this._createLabbookCallback}
                />


            </div>
          }
        </div>
      )
  }

  _currentComponent(){
    console.log(this._getSelectedComponentId())
    switch(this._getSelectedComponentId()){
        case 'createLabook':
          return(
            <CreateLabbook
              ref="createLabook"
              createLabbookCallback={this._createLabbookCallback}
              toggleDisabledContinue={this._toggleDisabledContinue}
            />)

        case 'selectBase':
          return(
            <SelectBase
              ref="selectBase"
              selectBaseCallback={this._selectBaseCallback}
              toggleDisabledContinue={this._toggleDisabledContinue}
              createLabbookMutation={this._createLabbookMutation}
            />)
        default:
          return(
            <CreateLabbook
              toggleDisabledContinue={this._toggleDisabledContinue}
              setComponent={this._setComponent}
              setLabbookName={this._setLabbookName}
              nextWindow={'selectBase'}
            />)

        }
      }

}

/**
  @param {}
  gets button text for current componenet
  @return {string} text
*/
function _getButtonText(state){
  let text = (state.selectedComponentId === 'successMessage') ? 'Done' : 'Save and Continue Setup'
  text = (state.selectedComponentId === 'importCode') ? 'Complete' : text;

  return text;
}


/**
  @param {}
  gets button text for current componenet
  @return {string} text
*/
function ModalNav({state, getSelectedComponentId, setComponent, hideModal, getButtonText, continueSave}){

  const continueSaveDisabled = ['createLabook', 'selectDevelopmentEnvironment', 'selectBase']

  let disabled = continueSaveDisabled.indexOf(state.selectedComponentId) > -1

  return(
    <div className="flex flex--row justify--center">
      <button
        disabled={(state.previousComponentId === null)}
        onClick={() => {setComponent(state.previousComponentId)}}
        className={(state.selectedComponentId === 'successMessage') ? 'hidden' : 'WizardModal__progress-button flat--button'}>
        Back
      </button>
      <button
        onClick={() => {hideModal()}}
        className={(state.selectedComponentId === 'successMessage') ? 'hidden' : 'WizardModal__progress-button flat--button'}>
        Cancel
      </button>
      <button
        onClick={() => {continueSave(false)}}
        disabled={(state.continueDisabled)}
        >
          {
            _getButtonText(state)
          }
      </button>
    </div>)
}

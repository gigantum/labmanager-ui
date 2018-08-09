//vendor
import React from 'react'
import classNames from 'classnames'
//components
import CreateLabbook from './CreateLabbook'
import SelectBase from './SelectBase'
import TrackingToggle from './TrackingToggle'
import Loader from 'Components/shared/Loader'
import ButtonLoader from 'Components/shared/ButtonLoader'
import Modal from 'Components/shared/Modal'
//mutations
import CreateLabbookMutation from 'Mutations/CreateLabbookMutation'
import BuildImageMutation from 'Mutations/BuildImageMutation'
//store
import store from 'JS/redux/store'




export default class WizardModal extends React.Component {
  constructor(props){
  	super(props);

  	this.state = {
      'name': '',
      'description': '',
      'repository': '',
      'componentId': '',
      'revision': '',
      'selectedComponentId': 'createLabbook',
      'nextComponentId': 'selectBase',
      'previousComponentId': null,
      'continueDisabled': true,
      'modalBlur': false,
      'menuVisibility': true,
      'isTrackingOn': true,
      'createLabbookButtonState': ''
    };

    this._createLabbookCallback = this._createLabbookCallback.bind(this)
    this._createLabbookMutation = this._createLabbookMutation.bind(this)
    this._selectBaseCallback = this._selectBaseCallback.bind(this)
    this._continueSave = this._continueSave.bind(this)
    this._setComponent = this._setComponent.bind(this)
    this._hideModal = this._hideModal.bind(this)
    this._updateTextState = this._updateTextState.bind(this)
    this._setLabbookName = this._setLabbookName.bind(this)
    this._getSelectedComponentId = this._getSelectedComponentId.bind(this)
    this._toggleDisabledContinue = this._toggleDisabledContinue.bind(this)
    this._toggleMenuVisibility = this._toggleMenuVisibility.bind(this)
    this._setTracking = this._setTracking.bind(this)
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
    @param {bool} menuVisibility
    shows hides navigation menu
  */
  _toggleMenuVisibility(menuVisibility){
    this.setState({menuVisibility: menuVisibility})
  }

  _setTracking(trackingState){

    this.setState({
      isTrackingOn: trackingState
    })
  }

  /**
    @param {}
    shows modal window by update component state
  */
  _showModal = () => {
    this.setState({
      'modal_visible': true,
      'selectedComponentId': 'createLabbook',
      'nextComponentId': 'selectBase',
      'previousComponent': null
    })
  }
  /**
    @param {}
    hides modal window by update component state
  */
  _hideModal = () => {
    this.setState({'modal_visible': false, menuVisibility: true})
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
  _continueSave = ({isSkip, text}) =>{
    this.refs[this._getSelectedComponentId()].continueSave(isSkip);
    this.setState({'continueDisabled': true});
    if (text === 'Create Labbook') this.setState({ modalBlur: true })
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

    const {repository, componentId, revision} = node
    this.setState({
      repository: repository,
      componentId: componentId,
      revision: revision
    })
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

    this.setState({
      createLabbookButtonState: 'loading'
    })

    CreateLabbookMutation(
      name,
      description,
      repository,
      componentId,
      revision,
      !self.state.isTrackingOn,
      (response, error) => {
        if(error){


          store.dispatch({
            type: 'ERROR_MESSAGE',
            payload: {
              message: `An error occured while trying to create Project '${name}'.`,
              messageBody: error
            }
          })

          this.setState({
            modalBlur: false ,
            createLabbookButtonState: 'error'
          })

          setTimeout(()=>{
            this.setState({
              createLabbookButtonState: ''
            })
          },2000)

        }else{
          
          const {owner, name} = response.createLabbook.labbook

          this.setState({
            createLabbookButtonState: 'finished'
          })

          setTimeout(()=>{
            self._buildImage(name, owner)


            self.props.history.push(`../projects/${owner}/${name}`)

            this.setState({
              createLabbookButtonState: ''
            })
          },2000)



        }
      }
    )
  }
  /**
      @param {name, owner}
      builds docker iamge of labbook
  */
  _buildImage(name, owner){
    BuildImageMutation(
      name,
      owner,
      false,
      (response, error)=>{
        if(error){
          console.error(error)
          store.dispatch(
            {
              type: 'ERROR_MESSAGE',
              payload: {
                message: `ERROR: Failed to build ${name}`,
                messsagesList: error
            }
          })
        }
      })
  }

  render(){
    let loaderCSS = classNames({
      'hidden': !this.state.modalBlur
    })
    let currentComponent = this._currentComponent()
    return(
      <div>
        {
          this.state.modal_visible &&
          <Modal
            size="large"
            handleClose={() => this._hideModal()}
            header={currentComponent.header}
            preHeader={currentComponent.preHeader}
            renderContent={() =>
              <div>
                {
                  currentComponent.component
                }
                <ModalNav
                  self={this}
                  state={this.state}
                  getSelectedComponentId={this._getSelectedComponentId}
                  setComponent={this._setComponent}
                  hideModal={this._hideModal}
                  continueSave={this._continueSave}
                  createLabbookCallback={this._createLabbookCallback}
                />
              </div>
            }
          />
        }
        {
          this.state.modalBlur &&
          <Loader className={loaderCSS}/>
        }
      </div>
      )
  }

  _currentComponent(){
    switch(this._getSelectedComponentId()){
      case 'createLabbook':
        return {
          component:
            (<CreateLabbook
              ref="createLabbook"
              createLabbookCallback={this._createLabbookCallback}
              toggleDisabledContinue={this._toggleDisabledContinue}
              history={this.props.history}
              hideModal={this._hideModal}
              auth={this.props.auth}
            />),
          header: "Create Project"
        }

      case 'selectBase':
        return {
          component:
          (<SelectBase
            ref="selectBase"
            selectBaseCallback={this._selectBaseCallback}
            toggleDisabledContinue={this._toggleDisabledContinue}
            createLabbookMutation={this._createLabbookMutation}
            toggleMenuVisibility={this._toggleMenuVisibility}
          />),
          header: 'Select A Base',
          preHeader: 'Create Project'
        }
      default:
      return {
        component:
          (<CreateLabbook
            ref="createLabbook"
            createLabbookCallback={this._createLabbookCallback}
            toggleDisabledContinue={this._toggleDisabledContinue}
            history={this.props.history}
            hideModal={this._hideModal}
            auth={this.props.auth}
          />),
        header: "Create Project"
      }
    }
  }

}

/**
  @param {}
  gets button text for current componenet
  @return {string} text
*/
function ModalNav({self, state, getSelectedComponentId, setComponent, hideModal, continueSave}){

  let backButton = classNames({
    'WizardModal__progress-button': true,
    'button--flat': true,
    'hidden': (state.selectedComponentId === 'createLabbook')
  })

  let trackingButton = classNames({
    'hidden': (state.selectedComponentId !== 'createLabbook')
  })

  let wizardModalNav = classNames({
    'WizardModal__nav': true,
    'hidden': !state.menuVisibility
  })

  return(
    <div className={wizardModalNav}>
      <div>
        <button
          onClick={() => {setComponent('createLabbook')}}
          className={backButton}>
          Back
        </button>
        <div className={trackingButton}>
          <TrackingToggle
            setTracking={self._setTracking}
          />
        </div>
      </div>
      <div className="WizardModal__nav-group">
        <div className="WizardModal__nav-item">
          <button
            onClick={() => {hideModal()}}
            className="WizardModal__progress-button button--flat">
            Cancel
          </button>
        </div>

        <div className="WizardModal__nav-item">
          { (state.selectedComponentId === 'createLabbook') &&
            <button
              onClick={() => {continueSave({isSkip: false, text: 'Continue'})}}
              disabled={(state.continueDisabled)}>
              Continue
            </button>
          }

          { (state.selectedComponentId === 'selectBase') &&
            <ButtonLoader
              buttonState={state.createLabbookButtonState}
              buttonText={"Create Project"}
              className=""
              params={{isSkip: false, text: 'Create Project'}}
              buttonDisabled={state.continueDisabled}
              clicked={continueSave}
            />
          }
        </div>
      </div>
    </div>)
}

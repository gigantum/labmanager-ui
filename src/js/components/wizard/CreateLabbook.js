//vendor
import React from 'react'
import classNames from 'classnames'
import uuidv4 from 'uuid/v4'
//utilities
import validation from 'JS/utils/Validation'
//components
import LoginPrompt from 'Components/labbook/branchMenu/LoginPrompt'
//mutations
import ImportRemoteLabbookMutation from 'Mutations/ImportRemoteLabbookMutation'
import BuildImageMutation from 'Mutations/BuildImageMutation'
//queries
import UserIdentity from 'JS/Auth/UserIdentity'
//store
import store from 'JS/redux/store'

export default class CreateLabbook extends React.Component {
  constructor(props){

  	super(props);

  	this.state = {
      'name': '',
      'description': '',
      'showError': false,
      'errorType': '',
      'remoteURL': '',
      'textWarning': 'hidden',
      'textLength': 0,
      'isUserValid': false,
      'showLoginPrompt': false
    };


    this.continueSave = this.continueSave.bind(this)
    this._updateTextState = this._updateTextState.bind(this)
    this._updateRemoteUrl =  this._updateRemoteUrl.bind(this)
    this._closeLoginPromptModal = this._closeLoginPromptModal.bind(this)

  }

  /**
  *   @param {Object} evt
  *   takes an event input
  *   creates a labbook mutation sets labbook name on parent component
  *   triggers setComponent to proceed to next view
  **/
  continueSave = (evt) => {
    if(navigator.onLine) {
      const {name, description} = this.state;
      const id = uuidv4()

      let self = this;

      if(this.state.remoteURL.length > 0){
        const labbookName = this.state.remoteURL.split('/')[this.state.remoteURL.split('/').length - 1]
        const owner = this.state.remoteURL.split('/')[this.state.remoteURL.split('/').length - 2]
        const remote = this.state.remoteURL.indexOf('https://') > -1 ? this.state.remoteURL + '.git' : 'https://' + this.state.remoteURL + '.git'

        UserIdentity.getUserIdentity().then(response => {

        if(response.data){

          if(response.data.userIdentity.isSessionValid){

            store.dispatch(
              {
                type: "MULTIPART_INFO_MESSAGE",
                payload: {
                  id: id,
                  message: 'Importing LabBook please wait',
                  isLast: false,
                  error: false
                }
              })
            ImportRemoteLabbookMutation(
              owner,
              labbookName,
              remote,
              (response, error) => {


                if(error){
                  console.error(error)
                  store.dispatch(
                    {
                      type: 'MULTIPART_INFO_MESSAGE',
                      payload: {
                        id: id,
                        message: 'ERROR: Could not import remote LabBook',
                        messageBody: error,
                        error: true
                    }
                  })

                }else if(response){

                  store.dispatch(
                    {
                      type: 'MULTIPART_INFO_MESSAGE',
                      payload: {
                        id: id,
                        message: `Successfully imported remote LabBook ${labbookName}`,
                        isLast: true,
                        error: false
                      }
                    })
                  BuildImageMutation(
                  labbookName,
                  owner,
                  false,
                  (error)=>{
                    if(error){
                      console.error(error)
                      store.dispatch(
                        {
                          type: 'MULTIPART_INFO_MESSAGE',
                          payload: {
                            id: id,
                            message: `ERROR: Failed to build ${labbookName}`,
                            messsagesList: error,
                            error: true
                        }
                      })
                    }
                  })
                  document.getElementById('modal__cover').classList.add('hidden')
                  self.props.history.replace(`/labbooks/${owner}/${labbookName}`)
                }else{

                  BuildImageMutation(
                  labbookName,
                  localStorage.getItem('username'),
                  false,
                  (error)=>{
                    if(error){
                      console.error(error)
                      store.dispatch(
                        {
                          type: 'MULTIPART_INFO_MESSAGE',
                          payload: {
                            id: id,
                            message: `ERROR: Failed to build ${labbookName}`,
                            messsagesList: error,
                            error: true
                        }
                      })
                    }
                  })
                }
              }
            )
          }else{

              store.dispatch(
                {
                  type: "MULTIPART_INFO_MESSAGE",
                  payload: {
                    id: id,
                    message: 'ERROR: User session not valid for remote import',
                    messsagesList: [{message:'User must be authenticated to perform this action.'}],
                    error: true
                  }
                })

              this.setState({'showLoginPrompt': true})
          }
          }
        })
      }
      else{
        this.props.createLabbookCallback(name, description)
      }
    } else {
      this.props.hideModal();
      store.dispatch({
        type: 'ERROR_MESSAGE',
        payload:{
          message: `Cannot create a labbook at this time.`,
          messageBody: [{message: 'An internet connection is required to create a Labbook.'}]
        }
      })
    }
  }
  /**
  *  @param {}
  *  closes login prompt modal
  *  @return {}
  */
  _closeLoginPromptModal(){
    this.setState({
      'showLoginPrompt': false
    })
    document.getElementById('modal__cover').classList.add('hidden')
  }
  /**
    @param {Object, string} evt,field
    updates text in a state object and passes object to setState method
  */
  _updateTextState = (evt, field) =>{
    let state = {}

    state[field] = evt.target.value;
    if(field === 'name'){
      let isMatch = validation.labbookName(evt.target.value)
      this.setState({
      'showError': ((isMatch === false) && (evt.target.value.length > 0)),
      'errorType': ''
      })

      this.props.toggleDisabledContinue((evt.target.value === "") || (isMatch === false));

    }
    let textLength = 1024 - evt.target.value.length
    if(textLength >= 100){
      state['textWarning'] = 'CreateLabbook__warning--hidden'
    }else if((textLength <= 100) && (textLength > 50)){
      state['textWarning'] = 'CreateLabbook__warning--green'
    }else if((textLength <= 50) && (textLength > 20)){
      state['textWarning'] = 'CreateLabbook__warning--yellow'
    }else{
      state['textWarning'] = 'CreateLabbook__warning--red'
    }
    state['textLength'] = textLength;

    this.setState(state)
  }


  /**
    @param {}
    returns error message
    @return {string} errorMessage
  */
  _getErrorText(){
    return this.state.errorType === 'send' ? 'Error: Last character cannot be a hyphen.' : 'Error: Title may only contain lowercase alphanumeric and `-`. (e.g. lab-book-title)'
  }

  /**
    @param {event} evt
    updates remote url state
  */
  _updateRemoteUrl(evt){

    this.setState({
      remoteURL: evt.target.value
    })
    if(evt.target.value.length > 0){
      this.props.toggleDisabledContinue(false);
    }else{
      this.props.toggleDisabledContinue(true);
    }
  }

  render(){

    let loginPromptModalCss = classNames({
      'CreateLabbook--login-prompt': this.state.showLoginPrompt,
      'hidden': !this.state.showLoginPrompt
    })
    return(
      <div className="CreateLabbook">
          <div className={loginPromptModalCss}>
            <div
              onClick={()=>{this._closeLoginPromptModal()}}
              className="BranchModal--close"></div>
            <LoginPrompt closeModal={this._closeLoginPromptModal}/>
          </div>
          <h4 className="CreateLabbook__header">Create LabBook</h4>
          <div className='CreateLabbook__modal-inner-container flex flex--column justify--space-between'>

            <div>
              <label>Title</label>
              <input
                type='text'
                className={this.state.showError ? 'invalid' : ''}
                onChange={(evt) => this._updateTextState(evt, 'name')}
                placeholder="Enter a unique, descriptive title"
              />
              <span className={this.state.showError ? 'error': 'hidden'}>{this._getErrorText()}</span>
            </div>

            <div>
              <label>Description</label>
              <textarea
                maxLength="1024"
                className="CreateLabbook__description-input"
                type="text"
                onChange={(evt) => this._updateTextState(evt, 'description')}

                placeholder="Briefly describe this LabBook, its purpose and any other key details. "
              />
              <p className={'CreateLabbook__warning ' + this.state.textWarning}>{`${this.state.textLength} characters remaining`}</p>
            </div>
            <div className="CreateLabbook__text-divider-container">
              <span className="CreateLabbook__text-divider">or</span>
            </div>
            <div>
              <label>Add public LabBook</label>
              <input
                onChange={(evt) => this._updateRemoteUrl(evt)}
                type='text'
                placeholder="Enter URL Location"
              />
            </div>

          </div>
        </div>
      )
  }
}

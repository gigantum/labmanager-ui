//vendor
import React from 'react'
import SweetAlert from 'sweetalert-react';
//utilities
import validation from 'JS/utils/Validation'
//mutations
import CreateLabbookMutation from 'Mutations/CreateLabbookMutation'
import ImportRemoteLabbookMutation from 'Mutations/ImportRemoteLabbookMutation'
import BuildImageMutation from 'Mutations/BuildImageMutation'
//store
import store from 'JS/redux/store'

export default class CreateLabbook extends React.Component {
  constructor(props){
  	super(props);

  	this.state = {
      'modal_visible': false,
      'name': '',
      'description': '',
      'showError': false,
      'show': false,
      'message': '',
      'errorType': '',
      'remoteURL': ''
    };


    this.continueSave = this.continueSave.bind(this)
    this._updateTextState = this._updateTextState.bind(this)
    this._updateRemoteUrl =  this._updateRemoteUrl.bind(this)

  }
   /**
     @param {Object} evt
     takes and event input
     creates a labbook mutation sets labbook name on parent component
     triggers setComponent to proceed to next view
   */

  continueSave = (evt) => {
    let viewerId = 'localLabbooks';//Todo: figure out what to do with viewerId in the mutation context
    let name = this.state.name;
    let self = this;
    if(this.state.remoteURL.length > 0){
      const labbookName = this.state.remoteURL.split('/')[this.state.remoteURL.split('/').length - 1]
      const owner = this.state.remoteURL.split('/')[this.state.remoteURL.split('/').length - 2]
      let remote = this.state.remoteURL + '.git'

      store.dispatch(
        {
          type: "UPLOAD_MESSAGE",
          payload: {
            error: false,
            open: true,
            success: false,
            uploadMessage: 'Importing LabBook please wait'
          }
        })
        console.log(owner,
          labbookName,
          remote)
      ImportRemoteLabbookMutation(
        owner,
        labbookName,
        remote,
        (response, error) => {


          if(error){
            console.error(error)
            store.dispatch(
              {
                type:"UPLOAD_MESSAGE",
                payload: {
                error: true,
                open: true,
                success: false,
                uploadMessage: 'Could not import remote LabBook'
              }
            })

          }else if(response){

            store.dispatch(
              {
                type: "UPLOAD_MESSAGE",
                payload: {
                  error: false,
                  open: true,
                  success: false,
                  uploadMessage: 'Successfully imported remote LabBook'
                }
              })
            BuildImageMutation(
            labbookName,
            localStorage.getItem('username'),
            (error)=>{
              if(error){
                console.error(error)
                store.dispatch(
                  {
                    type:"UPLOAD_MESSAGE",
                    payload: {
                    error: true,
                    open: true,
                    success: false,
                    uploadMessage: 'Build failed'
                  }
                })
              }
            })
            document.getElementById('modal__cover').classList.add('hidden')
            this.props.history.replace(`/labbooks/${labbookName}`)
          }else{

            BuildImageMutation(
            labbookName,
            localStorage.getItem('username'),
            (error)=>{
              if(error){
                console.error(error)
                store.dispatch(
                  {
                    type:"UPLOAD_MESSAGE",
                    payload: {
                    error: true,
                    open: true,
                    success: false,
                    uploadMessage: 'Build failed'
                  }
                })
              }
            })
          }
        }
      )
    }
    else{
      //create new labbook
      let isMatch = validation.labookNameSend(name);
      if(isMatch){
        CreateLabbookMutation(
          this.state.description,
          name,
          viewerId,
          (error) => {

            let showAlert = (error !== null)

            if(!showAlert){
              let message = showAlert ? error[0].message : '';
              this.setState({
                'show': showAlert,
                'message': message,
              })
            }

            this.props.setLabbookName(this.state.name)

            if(this.props.nextWindow){
              this.props.toggleDisabledContinue(true)
              this.props.setComponent(this.props.nextWindow)
            } else{

              this._hideModal();
            }

          }//route to new labbook on callback
        )
      }
      else{
        this.setState({
        'showError': true,
        'errorType': 'send'
        })
      }
    }
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
    this.setState(state)
  }


    /**
      @param {}
      returns error message
      @return {string} errorMessage
    */
  _getErrorText(){
    return this.state.errorType === 'send' ? 'Error: Last character cannot be a hyphen.' : 'Error: Title may only contain alphanumeric characters separated by hyphens. (e.g. lab-book-title)'
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
    return(
      <div className="CreateLabbook">
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
              <textarea className="CreateLabbook__description-input"
                type="text"
                onChange={(evt) => this._updateTextState(evt, 'description')}

                placeholder="Briefly describe this LabBook, its purpose and any other key details. "
              />
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

            <SweetAlert
              className="sa-error-container"
              show={this.state.show}
              type="error"
              title="Error"
              text={this.state.message}
              onConfirm={() => {this.state.reject(); this.setState({ show: false, message: ''})}} />
          </div>
        </div>
      )
  }
}

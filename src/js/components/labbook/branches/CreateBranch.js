//vendor
import React from 'react';
import classNames from 'classnames';
import dateFormat from 'dateformat';
import Moment from 'moment'
//Mutations
import CreateExperimentalBranchMutation from 'Mutations/branches/CreateExperimentalBranchMutation'
//components
import LoginPrompt from 'Components/labbook/branchMenu/LoginPrompt'
import ButtonLoader from 'Components/shared/ButtonLoader'
//utilities
import validation from 'JS/utils/Validation'
//store
import store from 'JS/redux/store'

export default class CreateBranchModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      'modalVisible': props.modalVisible,
      'showLoginPrompt': false,
      'textWarning': 'hidden',
      'textLength': 0,
      'showError': false,
      'branchName': '',
      'branchDescription': '',
      'createButtonClicked': false,
      'buttonLoaderCreateBranch': ''
    };

    this._showModal = this._showModal.bind(this)
    this._hideModal = this._hideModal.bind(this)
    this._createNewBranch = this._createNewBranch.bind(this)
    this._updateTextState = this._updateTextState.bind(this)
  }


  componentWillReceiveProps(nextProps) {

    if(nextProps.modalVisible !== this.state.modalVisible){
      this.setState({'modalVisible': nextProps.modalVisible})
    }

    if(nextProps.selected){
      let branchName = `rollback-to-${Moment(Date.parse(nextProps.selected.timestamp)).format("YYYYMMDD-HHmmss")}`
      this.setState({branchName})
    }
  }

  componentWillUpdate(nextProps, nextState) {

  }
  /**
  *   @param {}
  *   shows modal by setting state
  *   @return {}
  */
  _showModal() {
    this.setState({ 'modalVisible': true });
  }
  /**
  *   @param {}
  *   hides modal by stetting state
  *   @return {}
  */
  _hideModal(inputsDisabled) {

    if(!inputsDisabled){

      this.setState({ 'modalVisible': false });

      document.getElementById('modal__cover').classList.add('hidden')

      if(this.props.toggleModal){
        this.props.toggleModal('createBranchVisible')
      }
    }

  }
  /**
  *   @param {event,string} evt, key
  *   returns error text when a branch name is invalid
  *   @return {}
  */
  _getErrorText(){
    return this.state.errorType === 'send' ? 'Error: Last character cannot be a hyphen.' : 'Error: Branch name may only contain lowercase alphanumeric and `-`. (e.g. new-branch-name)'
  }
  /**
  *   @param {event,string} evt, key
  *   sets state of text using a key
  *   @return {}
  */
  _updateTextState = (evt, key) =>{
    let state = {}


    if(key === 'branchName'){
      let isMatch = validation.labbookName(evt.target.value)
      if (isMatch) {
        this.setState({
          'branchName': evt.target.value,
          'errorType': '',
          'showError': false
        })
      }else{
        this.setState({
          'showError': ((isMatch === false) && (evt.target.value.length > 0)),
          'errorType': ''
        })
      }
    }else{
      state[key] = evt.target.value;
    }

    let textLength = 240 - evt.target.value.length
    if(textLength >= 100){
      state['textWarning'] = 'CreateBranch__warning--hidden'
    }else if((textLength <= 100) && (textLength > 50)){
      state['textWarning'] = 'CreateBranch__warning--green'
    }else if((textLength <= 50) && (textLength > 20)){
      state['textWarning'] = 'CreateBranch__warning--yellow'
    }else{
      state['textWarning'] = 'CreateBranch__warning--red'
    }
    state['textLength'] = textLength;

    this.setState(state)
  }
  /**
  *   @param {}
  *   formats date for branch name
  *   @return {}
  */
  _formattedISO(date){
    return dateFormat(date, "isoDateTime").toLowerCase().replace(/:/g, '-')
  }
  /**
  *   @param {}
  *   triggers CreateExperimentalBranchMutation
  *   @return {}
  */
  _createNewBranch() {
    let self = this;

    const {owner, labbookName} = store.getState().routes
    const {branchName} = this.state
    const revision = this.props.selected ? this.props.selected.commit : null


    this.setState({buttonLoaderCreateBranch: 'loading'})
    CreateExperimentalBranchMutation(
      owner,
      labbookName,
      branchName,
      revision,
      (response, error) => {


        if (error) {
          store.dispatch({
            type: 'ERROR_MESSAGE',
            payload: {
              message: "Problem Creating new branch",
              messageBody: error
            }
          })

          setTimeout(()=> {
            this.setState({buttonLoaderCreateBranch: 'error'})
          }, 1000)

        }else{

          this.setState({buttonLoaderCreateBranch: 'finished'})
        }

        setTimeout(()=> {
          this.setState({buttonLoaderCreateBranch: ''})

          if(self._hideModal){
            self._hideModal()
          }

        }, 2000)

      })

    }

    render() {

      let loginPromptModalCss = classNames({
        'CreateBranch--login-prompt': this.state.showLoginPrompt,
        'hidden': !this.state.showLoginPrompt
      })
      const createDisabled = this.state.showError || (this.state.branchName.length === 0) || this.state.createButtonClicked

      const inputsDisabled = this.state.buttonLoaderCreateBranch !== '';

      return (
        <div>
          {this.state.modalVisible &&
            <div className="CreateBranch__container">
              <div className="CreateBranch__modal">
                <div
                  className="CreateBranch__modal-close"
                  onClick={() => this._hideModal(inputsDisabled)}>
                </div>

                <div className="CreateBranch">
                  <div className={loginPromptModalCss}>
                    <div
                      onClick={() => { this._closeLoginPromptModal() }}
                      className="BranchModal--close"></div>
                      <LoginPrompt closeModal={this._closeLoginPromptModal} />
                    </div>
                    <h4 className="CreateBranch__header">Create Branch</h4>
                    <div className='CreateBranch__modal-inner-container flex flex--column justify--space-between'>

                      <div>
                        <label>Name</label>
                        <input
                          type='text'
                          maxLength="100"
                          className={this.state.showError ? 'invalid' : ''}
                          onChange={(evt) => this._updateTextState(evt, 'branchName')}
                          onKeyUp={(evt) => this._updateTextState(evt, 'branchName')}
                          placeholder="Enter a unique branch name"
                          defaultValue={this.state.branchName}
                          disabled={inputsDisabled}
                        />
                        <span className={this.state.showError ? 'error' : 'hidden'}>{this._getErrorText()}</span>
                      </div>

                      <div>
                        <label>Description</label>
                        <textarea
                          className="CreateBranch__description-input"
                          disabled={inputsDisabled}

                          onChange={(evt) => this._updateTextState(evt, 'branchDescription')}
                          onKeyUp={(evt) => this._updateTextState(evt, 'branchDescription')}

                          maxLength="240"
                          placeholder="Briefly describe this branch, its purpose and any other key details. "
                          defaultValue={this.props.selected ? `Branch created on ${Moment().format("M/DD/YY h:mm:ss A")} to rollback workspace to ${Moment(Date.parse(this.props.selected.timestamp)).format("M/DD/YY h:mm:ss A")}.` : ''}
                        />
                        <p className={'CreateBranch__warning ' + this.state.textWarning}>{`${this.state.textLength} characters remaining`}</p>
                      </div>
                    </div>
                  </div>

                  <div className={'CreateBranchNav'}>
                    <div>
                    </div>
                    <div className="CreateBranch__nav-group">

                      <div className="CreateBranch_nav-item">
                        <button
                          disabled={inputsDisabled}
                          onClick={() => { this._hideModal() }}
                          className="CreateBranch__progress-button button--flat">
                          Cancel
                        </button>
                      </div>

                      <div className="CreateBranch_nav-item">
                        <ButtonLoader
                          ref="buttonLoaderCreateBranch"
                          buttonState={this.state.buttonLoaderCreateBranch}
                          buttonText={"Create"}
                          params={{}}
                          buttonDisabled={createDisabled}
                          clicked={this._createNewBranch}
                        />
                      </div>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          )
        }
      }

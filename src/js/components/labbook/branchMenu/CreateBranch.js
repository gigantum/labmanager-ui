//vendor
import React, { Component } from 'react'
//Mutations
import CreateBranchMutation from 'Mutations/branches/CreateBranchMutation'
//store
import store from 'JS/redux/store'
//utils
import validation from 'JS/utils/Validation'

export default class CreateBranch extends Component {
  constructor(props){
  	super(props);
  	this.state = {
      'newBranchName': '',
      deletePending: false
    };

    this._createNewBranch = this._createNewBranch.bind(this)
    this._setNewBranchName = this._setNewBranchName.bind(this)
  }
  /**
    @param {string} branchName
    creates a new branch
  */
  _createNewBranch(branchName) {
    let self = this;

    this._checkSessionIsValid().then((response) => {
      if (response.data) {

        if (response.data.userIdentity.isSessionValid) {
          this.setState({
            newBranchName: '',
            isValid: true,
          })

          CreateBranchMutation(
            this.state.owner,
            this.state.labbookName,
            branchName,
            this.props.labbookId,
            (error, response) => {
              self.props.toggleModal('createBranchVisible')
              if (error) {
                store.dispatch({
                  type: 'ERROR_MESSAGE',
                  payload: {
                    message: "Problem Creating new branch, make sure you have a valid session and internet connection",
                    messageBody: error
                  }
                })
              }
            })
        } else {

          //auth.login()
          self.setState({
            showLoginPrompt: true
          })
        }
      }
    })

  }

  /**
    @param {object} event
    validates new branch name and sets state if it passes validation
  */
  _setNewBranchName(evt) {

    let isValid = validation.labbookName(evt.target.value);

    if (isValid) {
      this.setState({
        newBranchName: evt.target.value,
        isValid: true
      })
    } else {
      this.setState({
        isValid: false
      })
    }
  }
  render(){

    return(
        <div className="CreateBranch">
          <h4 className="CreateBranch__header--new-branch">New Branch</h4>
          <hr />
          <input
            className="CreateBranch__name-input"
            onKeyUp={(evt) => { this._setNewBranchName(evt) }}
            type="text"
            placeholder="Branch name"
          />
          <p className={!this.state.isValid ? 'CreateBranch__error error' : 'CreateBranch__error visibility-hidden'}> Error: Title may only contain alphanumeric characters separated by hyphens. (e.g. my-branch-name)</p>
          <button
          className="CreateBranch__create-branch"
          disabled={(this.state.newBranchName.length === 0) && this.state.isValid}
          onClick={() => { this._createNewBranch(this.state.newBranchName) }}>
          Create Branch
          </button>
      </div>
    )
  }
}

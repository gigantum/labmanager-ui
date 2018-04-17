//vendor
import React from 'react';
//Mutations
import DeleteExperimentalBranchMutation from 'Mutations/branches/DeleteExperimentalBranchMutation'
//store
import store from 'JS/redux/store'

export default class CreateBranchModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      eneteredBranchName: ''
    };

  }
  /**
  *  @param {object} event
  *  updates state of eneteredBranchName
  *  @return {}
  */
  _updateBranchText(evt){
    this.setState({
      'eneteredBranchName': evt.target.value
    })
  }
  /**
  *  @param {}
  *  triggers DeleteExperimentalBranchMutation
  *  @return {}
  */
  _deleteBranch(){
    this.setState({
      'deleteModalVisible': false
    })

    const {
      owner,
      labbookName,
      labbookId,
      branchName,
      cleanBranchName
    } = this.props


    DeleteExperimentalBranchMutation(
      owner,
      labbookName,
      branchName,
      labbookId,
      (response, error) => {
        if(error){
          store.dispatch({
            type: 'ERROR_MESSAGE',
            payload:{
              message: `There was a problem deleting ${cleanBranchName}`,
              messageBody: error,
            }
          })
        }else{
          store.dispatch({
            type: 'INFO_MESSAGE',
            payload:{
              message: `Deleted ${cleanBranchName} successfully`
            }
          })
        }
      }
    )

  }

  render() {

    const {owner, cleanBranchName} = this.props

      return (
        <div
          key="BranchDelete__modal"
          className="BranchCard__delete-modal">
            <div
              onClick={() => this.props.toggleModal('deleteModalVisible')}
              className="BranchCard__close"></div>
            <h4 className="BranchCard__header">Delete Branch</h4>
            <p className="BranchCard__text BranchCard__text--red">You are going to remove {owner}/{cleanBranchName}. Remove branches cannot be restored. Are you sure?</p>
            <p className="BranchCard__text">This action can lead to data loss. To prevent accidental deletions we ask you to confirm your intention.</p>
            <p>Please type {cleanBranchName} to procceed.</p>
            <input
              onChange={(evt) => {this._updateBranchText(evt)}}
              onKeyUp={(evt) => {this._updateBranchText(evt)}}
              className="BranchCard__text"
              type="text"
              placeholder={"Enter branch name here"}
            />
            <div className="BranchCard__button-container">
              <button
                disabled={cleanBranchName !== this.state.eneteredBranchName}
                onClick={() => this._deleteBranch()}>
                Confirm
              </button>
            </div>
        </div>)
        }
      }

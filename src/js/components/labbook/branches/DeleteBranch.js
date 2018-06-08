//vendor
import React, {Component, Fragment} from 'react';
//components
import Modal from 'Components/shared/Modal'
//Mutations
import DeleteExperimentalBranchMutation from 'Mutations/branches/DeleteExperimentalBranchMutation'
//store
import store from 'JS/redux/store'

export default class DeleteBranch extends Component {
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


    this.props.toggleModal('deleteModalVisible')
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

      <Modal
        handleClose={() => this.props.toggleModal('deleteModalVisible')}
        size="medium"
        header="Delete Branch"
        renderContent={()=>
          <Fragment>
            <p className="BranchCard__text BranchCard__text--red">
              You are going to delete {owner}/{cleanBranchName}. Deleted branches cannot be restored. Are you sure?
            </p>

            <p className="BranchCard__text">
              This action can lead to data loss. Please type <b>{cleanBranchName}</b> to proceed.
            </p>

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
          </Fragment>
        }
      />
    )
  }
}

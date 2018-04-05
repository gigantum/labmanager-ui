//vendor
import React, { Component } from 'react'
//mutations
import WorkonExperimentalBranchMutation from 'Mutations/branches/WorkonExperimentalBranchMutation'
import MergeFromBranchMutation from 'Mutations/branches/MergeFromBranchMutation'
import DeleteExperimentalBranchMutation from 'Mutations/branches/DeleteExperimentalBranchMutation'
//store
import store from 'JS/redux/store'

export default class BranchCard extends Component {
  constructor(props){

  	super(props);
    const {owner, labbookName} = store.getState().routes

    this.state = {
      owner: owner,
      labbookName: labbookName,
      forceMerge: false,
      deleteModalVisible: false
    }

    this._merge = this._merge.bind(this)
    this._checkoutBranch = this._checkoutBranch.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if(!nextProps.branchesOpen){
        this.setState({
          deleteModalVisible: false
        })
    }
  }
  /**
    @param {}
    checkout branch using WorkonExperimentalBranchMutation
  */
  _checkoutBranch(){
    const branchName = this.props.name
    const {owner, labbookName} = this.state
    const revision = null

    store.dispatch({
      type: 'INFO_MESSAGE',
      payload:{
        message: `Checking out ${branchName}`,
      }
    })

    WorkonExperimentalBranchMutation(
      owner,
      labbookName,
      branchName,
      revision,
      (response, error)=>{

        if(error){
          console.error(error);
          store.dispatch({
            type: 'ERROR_MESSAGE',
            payload:{
              message: "Problem Checking out Branch, check you have a valid session and connection",
              messageBody: error,
            }
          })
        }else{
          store.dispatch({
            type: 'UPDATE_BRANCHES_VIEW',
            payload:{
              branchesOpen: false
            }
          })
        }
      })
  }
  /**
    @param {}
    merge branch using WorkonExperimentalBranchMutation
  */
  _merge(){
    const otherBranchName = this.props.name
    const {owner, labbookName} = this.state
    const force = false
    const {activeBranchName} =  this.props

    let self = this

    store.dispatch({
      type: 'INFO_MESSAGE',
      payload:{
        message: `Merging ${otherBranchName} into ${activeBranchName}`,
      }
    })

    MergeFromBranchMutation(
      owner,
      labbookName,
      otherBranchName,
      force,
      (response, error)=>{
        if(error){
          store.dispatch({
            type: 'ERROR_MESSAGE',
            payload:{
              message: `There was a problem merging ${otherBranchName} into ${activeBranchName}`,
              messageBody: error,
            }
          })
        }
        if(response.succes){
          store.dispatch({
            type: 'INFO_MESSAGE',
            payload:{
              message: `${otherBranchName} merged into ${activeBranchName} successfully`,
            }
          })
        }
      }
    )
  }
  /**
  *  @param {string} branchName
  *  makes branch name pretty
  *  @return {string} prettyBranchName
  */
  _sanitizeBranchName(branchName){
    const {owner} = this.state
    const workspace = `gm.workspace-${owner}`
    const prettyBranchName = (branchName === workspace) ? 'workspace' : branchName.replace(`${workspace}.`, '')

    return prettyBranchName
  }
  /**
   * @param {}
    opens delete branch confirnation modal

  */
  _toggleDeleteModal(){
    this.setState({
      deleteModalVisible: !this.state.deleteModalVisible
    })
  }
  /**
  *  @param {}
  *  triggers DeleteExperimentalBranchMutation
  *  @return {}
  */
  _deleteBranch(){
    this.setState({
      deleteModalVisible: false
    })
    const branchName = this.props.name
    const {owner, labbookName} = this.state
    const {labbookId} = this.props

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
              message: `There was a problem deleting ${branchName}`,
              messageBody: error,
            }
          })
        }else{
          store.dispatch({
            type: 'INFO_MESSAGE',
            payload:{
              message: `Deleted ${branchName} successfully`
            }
          })
        }
      }
    )

  }

  render(){
    const {owner} = this.state
    const isCurrentBranch = (this.props.name === this.props.activeBranchName)
    const branchName = this._sanitizeBranchName(this.props.name)
    const showDelete = !isCurrentBranch && (this.props.name !== `gm.workspace-${owner}`)
    return(
      <div className='BranchCard'>
        { isCurrentBranch &&
          <div className="BranchCard--current-banner">
            CURRENT BRANCH
          </div>

        }
        <h6 className="BranchCard__title">{branchName}</h6>
        { this.state.deleteModalVisible &&
          [<div className="BranchCard__delete-modal">
              <h4 className="BranchCard__header">Delete Branch</h4>
              <p className="BranchCard__text">Are you sure you want to delete {branchName}?</p>
              <div className="BranchCard__button-container">
                <button onClick={() => this._deleteBranch()}>Yes</button>
                <button onClick={()=> this._toggleDeleteModal()}>No</button>
              </div>
          </div>,
          <div className="BranchCard__modal"></div>
          ]
        }
        {showDelete &&
          <button
            onClick={()=> {this._toggleDeleteModal()}}
            className="BranchCard__delete-labbook">
          </button>
        }

        <div className="BranchCard__button">

          {this.props.mergeFilter &&
            <button
              onClick={()=>{this._merge()}}
              >
              Merge
            </button>
          }
          {!this.props.mergeFilter &&
            <button
              onClick={()=>{this._checkoutBranch()}}
              disabled={this.props.name === this.props.activeBranchName}
              >
              Switch To Branch
            </button>
          }
        </div>
      </div>
    )
  }
}

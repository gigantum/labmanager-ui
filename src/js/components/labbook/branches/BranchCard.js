//vendor
import React, { Component } from 'react'
import classNames from 'classnames'
//components
import Loader from 'Components/shared/Loader'
//mutations
import WorkonExperimentalBranchMutation from 'Mutations/branches/WorkonExperimentalBranchMutation'
import MergeFromBranchMutation from 'Mutations/branches/MergeFromBranchMutation'
import DeleteExperimentalBranchMutation from 'Mutations/branches/DeleteExperimentalBranchMutation'
import BuildImageMutation from 'Mutations/BuildImageMutation'
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
      deleteModalVisible: false,
      eneteredBranchName: '',
      showLoader: false
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

    this.setState({showLoader: true})

    WorkonExperimentalBranchMutation(
      owner,
      labbookName,
      branchName,
      revision,
      (response, error)=>{

        this.setState({showLoader: false})

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

          BuildImageMutation(
            labbookName,
            owner,
            false,
            (response, error)=>{
              console.log(error)
            }
          )
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

    this.setState({showLoader: true})

    MergeFromBranchMutation(
      owner,
      labbookName,
      otherBranchName,
      force,
      (response, error)=>{
        this.setState({showLoader: false})
        if(error){
          store.dispatch({
            type: 'ERROR_MESSAGE',
            payload:{
              message: `There was a problem merging ${otherBranchName} into ${activeBranchName}`,
              messageBody: error,
            }
          })

        }
        if(response.success){
          store.dispatch({
            type: 'INFO_MESSAGE',
            payload:{
              message: `${otherBranchName} merged into ${activeBranchName} successfully`,
            }
          })
        }

        BuildImageMutation(
          labbookName,
          owner,
          false,
          (response, error)=>{
            console.log(error)
          }
        )
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
      'deleteModalVisible': !this.state.deleteModalVisible,
      'eneteredBranchName': ''
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

  render(){
    const {owner, showLoader} = this.state
    const isCurrentBranch = (this.props.name === this.props.activeBranchName)
    const branchName = this._sanitizeBranchName(this.props.name)
    const showDelete = !isCurrentBranch && (this.props.name !== `gm.workspace-${owner}`)

    const branchCardCSS = classNames({
      'BranchCard': true,
      'BranchCard--loading': showLoader
    })

    return(
      <div className={branchCardCSS}>
        { isCurrentBranch &&
          <div className="BranchCard--current-banner">
            CURRENT BRANCH
          </div>

        }
        <h6 className="BranchCard__title">{branchName}</h6>
        { this.state.deleteModalVisible &&
          [<div
            key="BranchDelete__modal"
            className="BranchCard__delete-modal">
              <div
                onClick={() => this._toggleDeleteModal()}
                className="BranchCard__close"></div>
              <h4 className="BranchCard__header">Delete Branch</h4>
              <p className="BranchCard__text BranchCard__text--red">You are going to remove {owner}/{branchName}. Remove branches cannot be restored. Are you sure?</p>
              <p className="BranchCard__text">This action can lead to data loss. To prevent accidental deletions we ask you to confirm your intention.</p>
              <p>Please type {branchName} to procceed.</p>
              <input
                onChange={(evt) => {this._updateBranchText(evt)}}
                onKeyUp={(evt) => {this._updateBranchText(evt)}}
                className="BranchCard__text"
                type="text"
                placeholder={"Enter branch name here"}
              />
              <div className="BranchCard__button-container">
                <button
                  disabled={branchName !== this.state.eneteredBranchName}
                  onClick={() => this._deleteBranch()}>
                  Confirm
                </button>
              </div>
          </div>,
          <div
            key="BranchDelete__modal-cover"
            className="BranchCard__modal">
          </div>
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
              disabled={showLoader}
              onClick={()=>{this._merge()}}
              >
              Merge
            </button>
          }
          {!this.props.mergeFilter &&
            <button
              onClick={()=>{this._checkoutBranch()}}
              disabled={showLoader || (this.props.name === this.props.activeBranchName)}
              >
              Switch To Branch
            </button>
          }
        </div>
      </div>
    )
  }
}

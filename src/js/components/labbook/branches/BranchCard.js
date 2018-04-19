//vendor
import React, { Component } from 'react'
import classNames from 'classnames'
//components
import DeleteLabbook from './DeleteLabbook'
import ForceMerge from './ForceMerge'
//mutations
import WorkonExperimentalBranchMutation from 'Mutations/branches/WorkonExperimentalBranchMutation'
import MergeFromBranchMutation from 'Mutations/branches/MergeFromBranchMutation'
import BuildImageMutation from 'Mutations/BuildImageMutation'
//store
import store from 'JS/redux/store'
import FetchContainerStatus from 'Components/labbook/containerStatus/fetchContainerStatus'

export default class BranchCard extends Component {
  constructor(props){

  	super(props);
    const {owner, labbookName} = store.getState().routes
    const username = localStorage.getItem('username')
    this.state = {
      owner,
      labbookName,
      username,
      forceMerge: false,
      deleteModalVisible: false,
      showLoader: false,
      forceMergeVisible: false
    }

    this._merge = this._merge.bind(this)
    this._checkoutBranch = this._checkoutBranch.bind(this)
    this._toggleModal = this._toggleModal.bind(this)
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
    let self = this;
    const branchName = this.props.name
    const {owner, labbookName} = this.state
    const revision = null
    const cleanActiveBranchName = this._sanitizeBranchName(branchName)
    store.dispatch({
      type: 'INFO_MESSAGE',
      payload:{
        message: `Checking out ${cleanActiveBranchName}`,
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
          this.props.setBuildingState(true)
          BuildImageMutation(
            labbookName,
            owner,
            false,
            (response, error)=>{
              if(error){
                console.log(error)
              }
              let checkImage = setInterval(()=>{
                FetchContainerStatus.getContainerStatus(this.state.owner, this.state.labbookName)
                .then(res=>{
                  if(res.labbook.environment.imageStatus !== 'BUILD_IN_PROGRESS'){
                    this.props.setBuildingState(false)
                    clearInterval(checkImage)
                  }
                })
              }, 1000)
            }
          )
        }
      })
  }
  /**
    @param {}
    merge branch using WorkonExperimentalBranchMutation
  */
  _merge(force){

    const otherBranchName = this.props.name
    const {owner, labbookName} = this.state
    const {activeBranchName} =  this.props
    const cleanActiveBranchName = this._sanitizeBranchName(activeBranchName)
    const cleanOtherBranchName = this._sanitizeBranchName(otherBranchName)
    let self = this

    store.dispatch({
      type: 'INFO_MESSAGE',
      payload:{
        message: `Merging ${cleanOtherBranchName} into ${cleanActiveBranchName}`,
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
              message: `There was a problem merging ${cleanOtherBranchName} into ${cleanActiveBranchName}`,
              messageBody: error,
            }
          })

          if(error[0].message.indexOf('Cannot merge') > -1){
            self.setState({
              forceMergeVisible: true
            })
          }

        }
        if(response.mergeFromBranch && response.mergeFromBranch.labbook){
          store.dispatch({
            type: 'INFO_MESSAGE',
            payload:{
              message: `${cleanOtherBranchName} merged into ${cleanActiveBranchName} successfully`,
            }
          })
        }
        this.props.setBuildingState(true)
        BuildImageMutation(
          labbookName,
          owner,
          false,
          (response, error)=>{
            if(error){
              console.log(error)
            }
            let checkImage = setInterval(()=>{
              FetchContainerStatus.getContainerStatus(this.state.owner, this.state.labbookName)
              .then(res=>{
                if(res.labbook.environment.imageStatus !== 'BUILD_IN_PROGRESS'){
                  this.props.setBuildingState(false)
                  clearInterval(checkImage)
                }
              })
            }, 1000)
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
    const {username} = this.state
    const workspace = `gm.workspace-${username}`

    const prettyBranchName = (branchName === workspace) ? 'workspace' : branchName.replace(`${workspace}.`, '')

    return prettyBranchName
  }
  /**
   * @param {}
   * opens delete branch confirnation modal
   * @return{}
  */
  _toggleModal(name){
    this.setState({
      [name]: !this.state[name]
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
          [
            <DeleteLabbook
              branchName={this.props.name}
              cleanBranchName={branchName}
              labbookName={this.state.labbookName}
              labbookId={this.props.labbookId}
              owner={owner}
              toggleModal={this._toggleModal}
            />,
            <div
              key="BranchDelete__modal-cover"
              className="BranchCard__modal">
            </div>
          ]
        }

        { this.state.forceMergeVisible &&
          [
          <ForceMerge
            merge={this._merge}
            toggleModal={this._toggleModal}
          />,
          <div
            key="BranchDelete__modal-cover"
            className="BranchCard__modal">
          </div>
          ]
        }
        {showDelete &&
          <button
            onClick={()=> {this._toggleModal('deleteModalVisible')}}
            className="BranchCard__delete-labbook">
          </button>
        }

        <div className="BranchCard__button">

          {this.props.mergeFilter &&
            <button
              disabled={showLoader}
              onClick={()=>{this._merge(false)}}
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

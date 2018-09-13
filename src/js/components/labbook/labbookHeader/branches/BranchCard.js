//vendor
import React, { Component } from 'react'
import classNames from 'classnames'
//components
import DeleteBranch from './DeleteBranch'
import ForceMerge from './ForceMerge'
import ButtonLoader from 'Components/shared/ButtonLoader'
//mutations
import WorkonExperimentalBranchMutation from 'Mutations/branches/WorkonExperimentalBranchMutation'
import MergeFromBranchMutation from 'Mutations/branches/MergeFromBranchMutation'
import BuildImageMutation from 'Mutations/BuildImageMutation'
//store
import store from 'JS/redux/store'

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
      forceMergeVisible: false,
      buttonLoaderStateSwitch: '',
      buttonLoaderStateMerge: ''
    }

    this._merge = this._merge.bind(this)
    this._checkoutBranch = this._checkoutBranch.bind(this)
    this._toggleModal = this._toggleModal.bind(this)
    this._handleToggleModal = this._handleToggleModal.bind(this)
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
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

    requestAnimationFrame(() => {

      this.setState({
        showLoader: true,
        buttonLoaderStateSwitch: 'loading'
      })
    });

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
              message: "Problem Checking out Branch, check if you have a valid session and connection",
              messageBody: error,
            }
          })

          self.setState({
            showLoader: false,
            buttonLoaderStateSwitch: 'error'
          })

        }else{
          store.dispatch({
            type: 'FORCE_CANCEL_REFETCH',
            payload: {
              forceCancelRefetch: true,
            }
          })

          self.setState({
            showLoader: false,
            buttonLoaderStateSwitch: 'finished'
          })

          setTimeout(() => {
            self.setState({
              buttonLoaderStateSwitch: ''
            })
          }, 3000)

          this.props.setBuildingState(true)

          BuildImageMutation(
            labbookName,
            owner,
            false,
            (response, error)=>{
              if(error){
                console.log(error)
              }
            }
          )
        }
      })
  }
  /**
    @param {object,Object}
    merge branch using WorkonExperimentalBranchMutation
  */
  _merge(evt, params){
    const otherBranchName = this.props.name
    const {owner, labbookName} = this.state
    const {activeBranchName} =  this.props
    const {force} = params
    const cleanActiveBranchName = this._sanitizeBranchName(activeBranchName)
    const cleanOtherBranchName = this._sanitizeBranchName(otherBranchName)
    let self = this

    store.dispatch({
      type: 'INFO_MESSAGE',
      payload:{
        message: `Merging ${cleanOtherBranchName} into ${cleanActiveBranchName}`,
      }
    })

    this.setState({showLoader: true, buttonLoaderStateMerge: 'loading'})

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
              message: `There was a problem merging ${cleanOtherBranchName} into ${cleanActiveBranchName}`,
              messageBody: error,
            }
          })

          if(error[0].message.indexOf('Cannot merge') > -1){
            self.setState({
              forceMergeVisible: true
            })
          }

          self.setState({showLoader: false, buttonLoaderStateMerge: 'error'})

        }
        if(response.mergeFromBranch && response.mergeFromBranch.labbook){
          store.dispatch({
            type: 'INFO_MESSAGE',
            payload:{
              message: `${cleanOtherBranchName} merged into ${cleanActiveBranchName} successfully`,
            }
          })

          self.setState({showLoader: false, buttonLoaderStateMerge: 'finished'})
        }
        setTimeout(() => {
          self.setState({buttonLoaderStateMerge: ''})
        }, 3000)

        this.props.setBuildingState(true)

        BuildImageMutation(
          labbookName,
          owner,
          false,
          (response, error)=>{
            if(error){
              console.log(error)
            }
            self.setState({showLoader: false})
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

  /**
  *  @param {string} modal
  *  passes modal to toggleModal if container is not running
  *  @return {}
  */
 _handleToggleModal(modal) {
  if(store.getState().containerStatus.status !== 'Running'){
    this._toggleModal(modal)
  } else {
    store.dispatch({
      type: 'CONTAINER_MENU_WARNING',
      payload: {
        message: 'Stop Project before deleting branches. \n Be sure to save your changes.',
      }
    })
    store.dispatch({
      type: 'UPDATE_CONTAINER_MENU_VISIBILITY',
      payload: {
        containerMenuOpen: true
      }
    })
  }
}

  render(){
    const {owner, showLoader} = this.state
    const isCurrentBranch = (this.props.name === this.props.activeBranchName)
    const branchName = this._sanitizeBranchName(this.props.name)
    const showDelete = !isCurrentBranch && (this.props.name !== `gm.workspace-${owner}`)

    const branchCardCSS = classNames({
      'BranchCard': true
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
          <DeleteBranch
            key="BranchDelete__modal"
            branchName={this.props.name}
            cleanBranchName={branchName}
            labbookName={this.state.labbookName}
            labbookId={this.props.labbookId}
            owner={owner}
            toggleModal={this._toggleModal}
          />
        }

        { this.state.forceMergeVisible &&
          <ForceMerge
            key="ForceMerge__modal"
            merge={this._merge}
            params={{force: true}}
            toggleModal={this._toggleModal}
          />
        }
        {showDelete &&
          <button
            onClick={()=> {this._handleToggleModal('deleteModalVisible')}}
            className="BranchCard__delete-labbook">
          </button>
        }

        <div className="BranchCard__button">

          {this.props.mergeFilter &&


            <ButtonLoader
              ref="buttonLoaderMerge"
              buttonState={this.state.buttonLoaderStateMerge}
              params={{force: false}}
              buttonText={"Merge"}
              buttonDisabled={showLoader}
              clicked={this._merge}
            />

          }

          {!this.props.mergeFilter &&

            <ButtonLoader
              ref="buttonLoaderSwitch"
              buttonState={this.state.buttonLoaderStateSwitch}
              buttonText={"Switch To Branch"}
              params={{}}
              buttonDisabled={showLoader || (this.props.name === this.props.activeBranchName)}
              clicked={this._checkoutBranch}
            />

          }
        </div>
      </div>
    )
  }
}

//vendor
import React, { Component } from 'react'
//mutations
import WorkonExperimentalBranchMutation from 'Mutations/branches/WorkonExperimentalBranchMutation'
//store
import store from 'JS/redux/store'

export default class BranchCard extends Component {
  constructor(props){

  	super(props);
    const {owner, labbookName} = store.getState().routes

    this.state = {
      owner: owner,
      labbookName: labbookName
    }
  }
  /**

  */
  _checkoutBranch(){
    const branchName = this.props.name
    const {owner, labbookName} = this.state
    const revision = null

    WorkonExperimentalBranchMutation(
      owner,
      labbookName,
      branchName,
      revision,
      (error)=>{

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
  render(){

    const isCurrentBranch = (this.props.name === this.props.activeBranchName)

    return(
      <div className='BranchCard'>
        { isCurrentBranch &&
          <div className="BranchCard--current-banner">
            CURRENT BRANCH
          </div>

        }
        <h6 className="BranchCard__title">{this.props.name}</h6>

        <div className="BranchCard__button">
          <button
            onClick={()=>{this._checkoutBranch()}}
            disabled={this.props.name === this.props.activeBranchName}
            >
            Switch To Branch
          </button>
        </div>
      </div>
    )
  }
}

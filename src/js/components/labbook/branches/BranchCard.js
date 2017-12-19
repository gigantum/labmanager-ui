//vendor
import React, { Component } from 'react'
//mutations
import CheckoutBranchMutation from 'Mutations/branches/CheckoutBranchMutation'
//store
import store from 'JS/redux/store'

export default class BranchCard extends Component {
  constructor(props){

  	super(props);
  }
  /**

  */
  _checkoutBranch(){
    const branchName = this.props.edge.node.name
    CheckoutBranchMutation(
    localStorage.getItem('username'),
    this.props.labbookName,
    branchName,
    this.props.labbookId,
    (error)=>{
      if(error){
        console.error(error);
        store.dispatch({
          type: 'UPLOAD_MESSAGE',
          payload:{
            uploadMessage: error[0].message,
            error: true,
            open: true,
            success: false
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

    const isCurrentBranch = (this.props.edge.node.name === this.props.activeBranch.name)
    return(
      <div className='BranchCard'>
        { isCurrentBranch &&
          <div className="BranchCard--current-banner">
            CURRENT BRANCH
          </div>

        }
        <h6 className="BranchCard__title">{this.props.edge.node.name}</h6>

        <div className="BranchCard__button">
          <button
            onClick={()=>{this._checkoutBranch()}}
            disabled={true}
            >
            Switch To Branch
          </button>
        </div>
      </div>
    )
  }
}

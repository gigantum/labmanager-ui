//vendor
import React, { Component } from 'react'
import {
  createPaginationContainer,
  graphql
} from 'react-relay'
//componenets
import Loader from 'Components/shared/Loader'
import BranchCard from './BranchCard'
//mutations
import CreateBranchMutation from 'Mutations/branches/CreateBranchMutation'
//store
import store from 'JS/redux/store'
//utilities
import validation from 'JS/utils/Validation'

let unsubscribe;

class Branches extends Component {
  constructor(props){
    super(props)
    this.state = {
      branchesOpen: false,
      newBranchName: '',
      isValid: true
    }
    //this.state = store.getState().overview
    //
    this._toggleBranchesView = this._toggleBranchesView.bind(this)
    this._createNewBranch = this._createNewBranch.bind(this)
  }
  /*
    subscribe to store to update state
  */
  componentDidMount() {
    // unsubscribe = store.subscribe(() =>{
    //   this.storeDidUpdate(store.getState().overview)
    // })
  }
  /*
    unsubscribe from redux store
  */
  componentWillUnmount() {
    //unsubscribe()
    this._loadMore()
  }

  /*
    loads more edges via pagination
  */
  _loadMore() {
    let self = this;
    this.props.relay.loadMore(
     5, // Fetch the next 5 feed items
     (response, error) => {
       if(error){
         console.error(error)
       }

       if(self.props.labbook.branches &&
         self.props.labbook.branches.pageInfo.hasNextPage) {

         self._loadMore()
       }
     }
   );
  }
  /*
    @param {object} overview
    updates components state
  */
  storeDidUpdate = (overview) => {
    if(this.state !== overview){
      this.setState(overview);//triggers re-render when store updates
    }
  }

  _toggleBranchesView(){
    console.log(!this.state.branchesOpen)
    this.setState({branchesOpen: !this.state.branchesOpen})
  }
  /*
    @param {string} branchName
    creates a new branch
  */
  _createNewBranch(branchName){
    this.setState({
      branchesOpen: true,
      newBranchName: '',
      isValid: true
    })
    let username = localStorage.getItem('username')

    CreateBranchMutation(
      username,
      this.props.labbookName,
      branchName,
      this.props.labbookId,
      (error)=>{
        if(error){

        }
      })

  }
  /*
    @param {object} event
    validates new branch name and sets state if it passes validation
  */
  _setNewBranchName(evt){

      let isValid = validation.labbookName(evt.target.value);

      if(isValid){
        this.setState({
          newBranchName: evt.target.value,
          isValid: true
        })
      }else{
        this.setState({
          isValid: false
        })
      }
  }

  render(){

    if(this.props.labbook){

      return(
        <div className="Branches">
          <div className="Branches__title">
            <h5 onClick={()=> this._toggleBranchesView()}>{this.props.labbook.activeBranch.name}</h5>
          </div>

          <div className={this.state.branchesOpen ? 'Branches__branches-list' : 'Branches__branches-list Branches__branches-list--collapsed' }>
            <div
              className={'BranchCard--create-new'}>
              <input
                className="BranchCard__name-input"
                onKeyUp={(evt)=>{this._setNewBranchName(evt)}}
                type="text"
                placeholder="Branch name"
              />
              <p className={!this.state.isValid ? 'Branch__error error': 'Branch__error visibility-hidden'}> Error: Title may only contain alphanumeric characters separated by hyphens. (e.g. my-branch-name)</p>
              <button
                className="BranchCard__create-branch"
                disabled={(this.state.newBranchName.length === 0) && this.state.isValid}
                onClick={()=>{this._createNewBranch(this.state.newBranchName)}}>
                Create Branch
              </button>
            </div>
            {
              this.props.labbook.branches.edges.map((edge)=>{
                return (<BranchCard edge={edge} />)
              })
            }
          </div>

        </div>
      )
    } else{
      return (<Loader />)
    }
  }
}


/*
  notes pagination container
  contains notes fragment and for query consumption
*/
export default createPaginationContainer(
  Branches,
  {
    labbook: graphql`
      fragment Branches_labbook on Labbook{
        branches(first: $first, after: $cursor) @connection(key: "Branches_branches"){
          edges{
            node{
              id
              name
              prefix
              commit{
                hash
                shortHash
                committedOn
                id
              }
            }
            cursor
          }
          pageInfo{
            endCursor
            hasNextPage
            hasPreviousPage
            startCursor
          }
        }
        activeBranch{
          id
          name
          prefix
          commit{
            hash
            shortHash
            committedOn
            id
          }
        }
      }`
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
        return props.labbook && props.labbook.branches;
    },
    getFragmentVariables(prevVars, first, cursor) {

      return {
       ...prevVars,
       first: first,
     };
   },
   getVariables(props, {count, cursor, name, owner}, fragmentVariables) {
    const username = localStorage.getItem('username')
    cursor = props.labbook.branches.edges[props.labbook.branches.edges.length - 1].cursor
    let first = count;
    name = props.labbookName;
    owner = username;
     return {
       first,
       cursor,
       name,
       owner
       // in most cases, for variables other than connection filters like
       // `first`, `after`, etc. you may want to use the previous values.
       //orderBy: fragmentVariables.orderBy,
     };
   },
   query: graphql`
     query BranchesPaginationQuery($name: String!, $owner: String!, $first: Int!, $cursor: String){
       labbook(name: $name, owner: $owner){
         id
         description
         ...Branches_labbook
       }
     }`

  }
)

//vendor
import React, { Component } from 'react'
import {
  createPaginationContainer,
  graphql
} from 'react-relay'
//componenets
import Loader from 'Components/shared/Loader'
import BranchCard from './BranchCard'
//store
import store from 'JS/redux/store'


let unsubscribe;

class Branches extends Component {
  constructor(props){
    super(props)
    this.state = {
      newBranchName: '',
      isValid: true
    }

  }
  /**
    subscribe to store to update state
  */
  componentDidMount() {
    if(this.props.labbook.branches.pageInfo.hasNextPage){
      this._loadMore()
    }
  }

  /**
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
  /**
    @param {object} overview
    updates components state
  */
  storeDidUpdate = (overview) => {
    if(this.state !== overview){
      this.setState(overview);//triggers re-render when store updates
    }
  }


  render(){

    if(this.props.labbook){

      return(
        <div className="Branches">

          <div className={this.props.branchesOpen ? 'Branches__branches-list' : 'Branches__branches-list Branches__branches-list--collapsed' }>

            {
              this.props.labbook.branches.edges.map((edge)=>{
                return (<BranchCard key={edge.node.id} edge={edge} />)
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

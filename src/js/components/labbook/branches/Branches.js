//vendor
import React, { Component } from 'react'
import {
  createPaginationContainer,
  graphql
} from 'react-relay'
import classNames from 'classnames'
//componenets
import Loader from 'Components/shared/Loader'
import BranchCard from './BranchCard'
//store
import store from 'JS/redux/store'


class Branches extends Component {
  constructor(props){
    super(props)
    this.state = {
      newBranchName: '',
      isValid: true,
      listPosition: 0,
      width: 0,
    }

  }
  /**
    subscribe to store to update state
  */
  componentDidMount() {
    if(this.props.labbook.branches.pageInfo.hasNextPage){
      this._loadMore()
    }
    const width = this.refs.Branches__branchesList.offsetWidth
    this.setState({width: width})
  }
  /**
  *  @param {object} overview
  *  updates components state
  *  @return
  */
  storeDidUpdate = (overview) => {
    if(this.state !== overview){
      this.setState(overview);//triggers re-render when store updates
    }
  }
  /**
  * @param {}
  * loads more edges via pagination
  * @return{}
  */
  _loadMore() {
    const {relay} = this.props
    let self = this;

    relay.loadMore(
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
  * @param {number} value
  * updates list position in state
  * @return{}
  */
  _updatePosition(value){

    this.setState({listPosition: (this.state.listPosition + value)})

  }
  /**
  * @param {array} branches
  * updates list position in state
  * @return{array} filteredBranches
  */
  _filterBranches(branches){
    let activeBranch
    let filteredBranches = branches.filter((branch) => {

      if(branch.node.name === this.props.labbook.activeBranch.name){
        activeBranch = branch;
      }
      return (branch.node.name !== this.props.labbook.activeBranch.name)
    });

    if(activeBranch){
      filteredBranches.unshift(activeBranch);
    }
    return filteredBranches
  }

  render(){
    let showRightBumper = (-this.state.listPosition < (25 * (this.props.labbook.branches.edges.length - 4)))

    if(this.props.labbook){
      const branches = this._filterBranches(this.props.labbook.branches.edges);

      const branchesCSS = classNames({
        'Branches': this.props.branchesOpen,
        'Branches--closed': !this.props.branchesOpen
      })

      const leftBumperCSS = classNames({
        'Brances__slider-button--left': (-this.state.listPosition > 0),
        'hidden': !(-this.state.listPosition > 0)
      })

      const branchesListCSS = classNames({
        'Branches__branches-list': true,
        'Branches__branches-list--collapsed': !this.props.branchesOpen
      })

      const rightBumperCSS = classNames({
        'Brances__slider-button--left': this.props.branchesOpen && (showRightBumper),
        'hidden': !(this.props.branchesOpen && (showRightBumper))
      })
      console.log(this.props.labbook)
      return(
        <div className={branchesCSS}>

          <button
            onClick={() => {this._updatePosition(25)}}
            className={leftBumperCSS}></button>
          <div
            ref="Branches__branchesList"
            className={branchesListCSS}
            style={{left: (this.state.listPosition < 0) ? ' calc(' + this.state.listPosition + 'vw - 200px)' : ' 0vw'}}>

            {
              branches.map((edge)=>{
                return (

                  <div
                    key={edge.node.id}
                    className="Branches__card-wrapper">
                      <BranchCard
                        activeBranch={this.props.activeBranch}
                        edge={edge}
                        labbookId={this.props.labbookId}
                      />
                  </div>)
              })
            }
          </div>
          <button
            onClick={() => {this._updatePosition(-25)}}
            className={rightBumperCSS}></button>

        </div>
      )
    } else{
      return (<Loader />)
    }
  }
}


/*
  activity pagination container
  contains activity fragment and for query consumption
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
              refName
              commit{
                hash
                shortHash
                committedOn
                id
                name
                owner
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
          refName
          prefix
          commit{
            hash
            shortHash
            committedOn
            id
            name
            owner
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
   getVariables(props, {count, cursor}, fragmentVariables) {
     const {owner, labbookName} = store.getState().routes
     const name = labbookName
     let first = count
     cursor = props.labbook.branches.edges[props.labbook.branches.edges.length - 1].cursor

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

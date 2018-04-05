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


export default class Branches extends Component {
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
    // if(this.props.labbook.branches.pageInfo.hasNextPage){
    //   this._loadMore()
    // }
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

    let activeBranchName

    let filteredBranches = branches.filter((branchName) => {
      return (branchName !== this.props.labbook.activeBranchName)
    });

    if(!this.props.mergeFilter){
      filteredBranches.unshift(this.props.labbook.activeBranchName);
    }

    return filteredBranches
  }

  render(){

    let showRightBumper = (-this.state.listPosition < (25 * (this.props.labbook.availableBranchNames.length - 4)))

    if(this.props.labbook){
      const {labbook} = this.props
      const branchArrayToFilter = this.props.mergeFilter ?  labbook.mergeableBranchNames : labbook.availableBranchNames
      const branches = this._filterBranches(branchArrayToFilter);

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
              branches.map((name)=>{
                return (

                  <div
                    key={name}
                    className="Branches__card-wrapper">
                      <BranchCard
                        activeBranchName={this.props.labbook.activeBranchName}
                        name={name}
                        labbookId={this.props.labbookId}
                        mergeFilter={this.props.mergeFilter}
                        branchesOpen={this.props.branchesOpen}
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

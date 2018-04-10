//vendor
import React, { Component } from 'react'
import {
  createPaginationContainer,
  graphql
} from 'react-relay'
import Slider from 'react-slick';
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
      listPositionIndex: 0,
      width: 0,
    }

    this._windowResize = this._windowResize.bind(this)
  }
  /**
    subscribe to store to update state
  */
  componentDidMount() {

    const width = this.refs.Branches__branchesList.offsetWidth - 30
    this.setState({width: width})

    window.addEventListener('resize', this._windowResize)
  }

  componentWillMount() {
    window.removeEventListener('resize', this._windowResize)
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
  *  @param {}
  *  triggers on resize
  * update width in state
  *  @return
  */
  _windowResize(evt){
    const width = this.refs.Branches__branchesList.offsetWidth - 30
    this.setState({width: width})
  }
  /**
  * @param {number} value
  * updates list position in state
  * @return{}
  */
  _updatePosition(index){
    this.setState({listPositionIndex: (this.state.listPositionIndex + index)})
  }
  /**
  * @param {array} branches
  * updates list position in state
  * @return{array} filteredBranches
  */
  _filterBranches(branches){

    let filteredBranches = branches.filter((branchName) => {
      return (branchName !== this.props.labbook.activeBranchName)
    });

    if(!this.props.mergeFilter){
      filteredBranches.unshift(this.props.labbook.activeBranchName);
    }

    return filteredBranches
  }

  render(){

    if(this.props.labbook){
      const listPositionIndex = this.state.listPositionIndex
      const {labbook} = this.props
      const branchArrayToFilter = this.props.mergeFilter ?  labbook.mergeableBranchNames : labbook.availableBranchNames
      const branches = this._filterBranches(branchArrayToFilter);
      const showRightBumper = (listPositionIndex < (labbook.availableBranchNames.length - 4))
      const branchesCSS = classNames({
        'Branches': this.props.branchesOpen,
        'Branches--closed': !this.props.branchesOpen
      })

      const leftBumperCSS = classNames({
        'Brances__slider-button--left': (listPositionIndex > 0),
        'hidden': !(listPositionIndex > 0)
      })

      const branchesListCSS = classNames({
        'Branches__branches-list': true,
        'Branches__branches-list--collapsed': !this.props.branchesOpen
      })

      const rightBumperCSS = classNames({
        'Brances__slider-button--right': this.props.branchesOpen && (showRightBumper),
        'hidden': !(this.props.branchesOpen && (showRightBumper))
      })
      const width = listPositionIndex * (this.state.width/branches.length)
      const widthPX = `-${width}px`;

      return(
        <div ref="Branches__branchesList__cover" className={branchesCSS}>

          <button
            onClick={() => {this._updatePosition(-1)}}
            className={leftBumperCSS}></button>
          <div
            ref="Branches__branchesList"
            className={branchesListCSS}
            style={{left: (listPositionIndex > 0) ? widthPX : ' 0vw'}}>

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
            onClick={() => {this._updatePosition(1)}}
            className={rightBumperCSS}></button>

        </div>
      )
    } else{
      return (<Loader />)
    }
  }
}

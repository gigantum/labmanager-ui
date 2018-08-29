//vendor
import React, { Component } from 'react'
import classNames from 'classnames'
//componenets
import Loader from 'Components/shared/Loader'
import BranchCard from './BranchCard'


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
    this._determineVisibleBranchCount = this._determineVisibleBranchCount.bind(this)
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

  UNSAFE_componentWillMount() {
    window.removeEventListener('resize', this._windowResize)
  }
  /**
  *  @param {}
  *  triggers on resize
  * update width in state
  *  @return
  */
  _windowResize(evt){
    if(this.refs.Branches__branchesList){
      const width = this.refs.Branches__branchesList.offsetWidth - 30
      this.setState({width: width})
    }
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
  /**
  * @param {}
  * determines how many branches are visible based on window width
  * @return {int} branchCount
  */
  _determineVisibleBranchCount() {
    let branchCount = 5;
    if (window.innerWidth <= 1239) {
      branchCount = 3;
    } else if (window.innerWidth <= 1600) {
      branchCount = 4;
    }
    return branchCount;
  }

  render(){
    if(this.props.labbook){
      const listPositionIndex = this.state.listPositionIndex
      const {labbook} = this.props

      const branchArrayToFilter = this.props.mergeFilter ?  labbook.mergeableBranchNames : labbook.availableBranchNames

      const branches = this._filterBranches(branchArrayToFilter);
      const branchesVisibleCount = this._determineVisibleBranchCount();

      const showRightBumper = (listPositionIndex < (labbook.availableBranchNames.length - branchesVisibleCount))


      const branchesCSS = classNames({
        'Branches': this.props.branchesOpen,
        'Branches--closed': !this.props.branchesOpen
      })

      const leftBumperCSS = classNames({
        'Branches__slider-button--left': (listPositionIndex > 0),
        'hidden': !(listPositionIndex > 0)
      })

      const branchesListCSS = classNames({
        'Branches__branches-list': true,
        'Branches__branches-list--collapsed': !this.props.branchesOpen
      })

      const rightBumperCSS = classNames({
        'Branches__slider-button--right': this.props.branchesOpen && (showRightBumper),
        'hidden': !(this.props.branchesOpen && (showRightBumper))
      })
      const width = listPositionIndex * (this.state.width/branches.length)

      const widthPX = `-${width}px`;

      return(
        <div ref="Branches__branchesList__cover" className={branchesCSS}>
          <div
            onClick={() => {this.props.toggleBranchesView(false, false)}}
            className="Branhces__button--close"></div>
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
                        setBuildingState={this.props.setBuildingState}
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

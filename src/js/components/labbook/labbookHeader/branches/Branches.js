// vendor
import React, { Component } from 'react';
import classNames from 'classnames';
// componenets
import Loader from 'Components/shared/Loader';
import BranchCard from './BranchCard';
// assets
import './Branches.scss';

export default class Branches extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newBranchName: '',
      isValid: true,
      listPosition: 0,
      listPositionIndex: 0,
      width: 0,
    };
    this._determineVisibleBranchCount = this._determineVisibleBranchCount.bind(this);
    this._windowResize = this._windowResize.bind(this);
  }

  /**
    subscribe to store to update state
  */
  componentDidMount() {
    const width = this.refs.Branches__branchesList.offsetWidth - 30;
    this.setState({ width });

    window.addEventListener('resize', this._windowResize);
  }

  UNSAFE_componentWillMount() {
    window.removeEventListener('resize', this._windowResize);
  }

  /**
  *  @param {}
  *  triggers on resize
  * update width in state
  *  @return
  */
  _windowResize(evt) {
    if (this.refs.Branches__branchesList) {
      const width = this.refs.Branches__branchesList.offsetWidth - 30;
      this.setState({ width });
    }
  }

  /**
  * @param {number} value
  * updates list position in state
  * @return{}
  */
  _updatePosition(index) {
    this.setState({ listPositionIndex: (this.state.listPositionIndex + index) });
  }

  /**
  * @param {array} branches
  * updates list position in state
  * @return{array} filteredBranches
  */
  _filterBranches(branches) {
    const filteredBranches = branches.filter(branchName => (branchName !== this.props.labbook.activeBranchName));

    if (!this.props.mergeFilter) {
      filteredBranches.unshift(this.props.labbook.activeBranchName);
    }

    return filteredBranches;
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

  render() {
    if (this.props.labbook) {
      const listPositionIndex = this.state.listPositionIndex,

        { labbook } = this.props,

        branchArrayToFilter = this.props.mergeFilter ? labbook.mergeableBranchNames : labbook.availableBranchNames,

        branches = this._filterBranches(branchArrayToFilter),

        branchesVisibleCount = this._determineVisibleBranchCount(),

        showRightBumper = (listPositionIndex < (labbook.availableBranchNames.length - branchesVisibleCount)),

        width = listPositionIndex * (this.state.width / branches.length),

        widthPX = `-${width}px`;

      /** ***************************
       * CSS ClassNames
       ***************************** */

      const branchesCSS = classNames({
          Branches: this.props.branchesOpen,
          'Branches Branches--collapsed': !this.props.branchesOpen,
        }),

        branchesListCoverCSS = classNames({
          'Branches__list-cover': this.props.branchesOpen,
          'Branches__list-cover--closed': !this.props.branchesOpen,
        }),

        branchesShadowUpperCSS = classNames({
          'Branches__shadow Branches__shadow--upper': this.props.branchesOpen,
          hidden: !this.props.branchesOpen,
        }),

        branchesShadowLowerCSS = classNames({
          'Branches__shadow Branches__shadow--lower': this.props.branchesOpen,
          hidden: !this.props.branchesOpen,
        }),

        leftBumperCSS = classNames({
          'Branches__btn--slider Branches__btn--left': (listPositionIndex > 0),
          hidden: !(listPositionIndex > 0),
        }),

        branchesListCSS = classNames({
          Branches__list: true,
          'Branches__list--collapsed': !this.props.branchesOpen,
        }),

        rightBumperCSS = classNames({
          'Branches__btn--slider Branches__btn--right': this.props.branchesOpen && (showRightBumper),
          hidden: !(this.props.branchesOpen && (showRightBumper)),
        });

      return (

        <div className={branchesCSS}>

          <div className={branchesShadowUpperCSS} />

          <div ref="Branches__branchesList__cover" className={branchesListCoverCSS}>

            <div
              onClick={() => { this.props.toggleBranchesView(false, false); }}
              className="Branches__btn--close"
            />

            <button
              onClick={() => { this._updatePosition(-1); }}
              className={leftBumperCSS}
            />

            <div
              ref="Branches__branchesList"
              className={branchesListCSS}
              style={{ left: (listPositionIndex > 0) ? widthPX : ' 0vw' }}
            >

              {
                  branches.map(name => (

                    <div
                      key={name}
                      className="Branches__cardWrapper"
                    >
                      <BranchCard
                        activeBranchName={this.props.labbook.activeBranchName}
                        name={name}
                        labbookId={this.props.labbookId}
                        mergeFilter={this.props.mergeFilter}
                        branchesOpen={this.props.branchesOpen}
                        setBuildingState={this.props.setBuildingState}
                      />
                    </div>))
                }

            </div>

            <button
              onClick={() => { this._updatePosition(1); }}
              className={rightBumperCSS}
            />

          </div>
          <div className={branchesShadowLowerCSS} />
        </div>
      );
    }
    return (<Loader />);
  }
}

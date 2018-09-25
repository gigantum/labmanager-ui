// vendor
import React, { Component, Fragment } from 'react';
import {
  createPaginationContainer,
  graphql,
} from 'react-relay';
import classNames from 'classnames';
// store
import { setContainerMenuWarningMessage } from 'JS/redux/reducers/labbook/environment/environment';
import store from 'JS/redux/store';
// Components
import ActivityCard from './ActivityCard';
import Loader from 'Components/shared/Loader';
import UserNote from './UserNote';
import PaginationLoader from './ActivityLoaders/PaginationLoader';
import CreateBranch from 'Components/labbook/labbookHeader/branches/CreateBranch';
import NewActivity from './NewActivity';
import ToolTip from 'Components/shared/ToolTip';
import ErrorBoundary from 'Components/shared/ErrorBoundary';
// config
import config from 'JS/config';
// assets
import './Activity.scss';


// local variables
let pagination = false;

let counter = 5;
let isMounted = false;

class Activity extends Component {
  constructor(props) {
  	super(props);
  	this.state = {
      modalVisible: false,
      isPaginating: false,
      selectedNode: null,
      createBranchVisible: false,
      refetchEnabled: false,
      newActivityAvailable: false,
      newActivityPolling: false,
      editorFullscreen: false,
      hoveredRollback: null,
      expandedClusterObject: new Map(),
      newActivityForcePaused: false,
      refetchForcePaused: false,
      activityRecords: this._transformActivity(this.props.labbook.activityRecords),
      stickyDate: false,
      compressedElements: new Set(),
    };
    this.dates = [];

    // bind functions here
    this._loadMore = this._loadMore.bind(this);
    this._toggleActivity = this._toggleActivity.bind(this);
    this._hideAddActivity = this._hideAddActivity.bind(this);
    this._handleScroll = this._handleScroll.bind(this);
    this._refetch = this._refetch.bind(this);
    this._startRefetch = this._startRefetch.bind(this);
    this._scrollTo = this._scrollTo.bind(this);
    this._stopRefetch = this._stopRefetch.bind(this);
    this._toggleCreateModal = this._toggleCreateModal.bind(this);
    this._getNewActivities = this._getNewActivities.bind(this);
    this._changeFullscreenState = this._changeFullscreenState.bind(this);
    this._handleVisibilityChange = this._handleVisibilityChange.bind(this);
    this._transformActivity = this._transformActivity.bind(this);
    this._countUnexpandedRecords = this._countUnexpandedRecords.bind(this);
    this._addCluster = this._addCluster.bind(this);
    this._compressExpanded = this._compressExpanded.bind(this);
    this._setStickyDate = this._setStickyDate.bind(this);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const activityRecords = nextProps.labbook.activityRecords;
    if (JSON.stringify(this._transformActivity(activityRecords)) !== JSON.stringify(this.state.activityRecords)) {
      const prevCommit = this.props.labbook && this.props.labbook.activityRecords.edges && this.props.labbook.activityRecords.edges[0].node;
      const newcommit = nextProps.labbook && nextProps.labbook.activityRecords.edges && nextProps.labbook.activityRecords.edges[0].node;

      if (prevCommit && prevCommit !== newcommit) {
        this.setState({ expandedClusterObject: new Map() }, () => this.setState({ activityRecords: this._transformActivity(activityRecords) }));
      } else {
        this.setState({ activityRecords: this._transformActivity(activityRecords) });
      }
    }

    if (activityRecords.pageInfo.hasNextPage && (activityRecords.edges.length < 3)) {
      this._loadMore();
    }
  }

  /**
  *  @param {}
  *   add scroll listener
  *   add interval to poll for new activityRecords
  */
  componentDidMount() {
    isMounted = true;

    const activityRecords = this.props.labbook.activityRecords;

    window.addEventListener('scroll', this._handleScroll);
    window.addEventListener('visibilitychange', this._handleVisibilityChange);

    if (activityRecords.pageInfo.hasNextPage && (this._countUnexpandedRecords() < 7)) {
      this._loadMore();
    }

    if (activityRecords.edges && activityRecords.edges.length) {
      this.setState({ refetchEnabled: true });
      this._refetch();
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    clearTimeout(this.refetchTimeout);
    clearTimeout(this.newActivityTimeout);
    isMounted = false;

    window.removeEventListener('visibilitychange', this._handleVisibilityChange);
    window.removeEventListener('scroll', this._handleScroll);
  }
  /**
   * @param {}
   * scroll to top of page
   * deletes activity feed in the relay store
   * resets counter
   * calls restart function
   * removes scroll listener
   * @return {}
   */
  _scrollTo(evt) {
    if (document.documentElement.scrollTop === 0) {
      const { relay } = this.props;

      const store = relay.environment.getStore();

      this.props.labbook.activityRecords.edges.forEach((edge) => {
        store._recordSource.delete(edge.node.id);
      });

      counter = 5;

      this._startRefetch();

      window.removeEventListener('scroll', this._scrollTo);
    }
  }
  /**
   * @param {}
   * handles refiring new activity query if visibility changes back to visible
   * @return {}
   */
  _handleVisibilityChange() {
    if (this.state.newActivityForcePaused) {
      this._stopRefetch();
      this.setState({ newActivityForcePaused: false });
    } else if (this.state.refetchForcePaused) {
      this._refetch();
      this.setState({ refetchForcePaused: false });
    }
  }
  /**
   * @param {}
   * sets scroll listener
   * kicks off scroll to top
   * @return {}
   */
  _getNewActivities() {
    window.addEventListener('scroll', this._scrollTo);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
  /**
   * @param {}
   * restarts refetch
   * @return {}
   */
  _startRefetch() {
    if (this.state.newActivityPolling) {
      this.setState({
        refetchEnabled: true,
        newActivityPolling: false,
        newActivityAvailable: false,
      });

      this._refetch();
    }
  }
  /**
   * @param {}
   * stops refetch from firing
   * @return {}
   */
  _stopRefetch() {
    const self = this;

    if (!this.state.newActivityPolling) {
      this.setState({
        refetchEnabled: false,
        newActivityPolling: true,
        newActivityAvailable: false,
      });

      const { labbookName, owner } = store.getState().routes;

      const getNewActivity = () => {
        NewActivity.getNewActivity(labbookName, owner).then((response) => {
          const firstRecordCommitId = self.props.labbook.activityRecords.edges[0].node.commit;
          const newRecordCommitId = response.data.labbook.activityRecords.edges[0].node.commit;

          if (firstRecordCommitId === newRecordCommitId) {
            self.newActivityTimeout = setTimeout(() => {
              if (isMounted && document.visibilityState === 'visible' && !this.state.refetchEnabled) {
                getNewActivity();
              } else if (isMounted && document.visibilityState !== 'visible' && !this.state.refetchEnabled) {
                this.setState({ newActivityForcePaused: true, newActivityPolling: false });
              }
            }, 3000);
          } else {
            this.setState({ newActivityAvailable: true });
          }
        }).catch(error => console.log(error));
      };

      getNewActivity();
    }
  }

  /**
  * @param {}
  * refetches component looking for new edges to insert at the top of the activity feed
  * @return {}
  */
  _refetch() {
    const self = this;
    const relay = this.props.relay;
    const activityRecords = this.props.labbook.activityRecords;

    const cursor = activityRecords.edges.node ? activityRecords.edges[activityRecords.edges.length - 1].node.cursor : null;

    relay.refetchConnection(
      counter,
      (response, error) => {
        self.refetchTimeout = setTimeout(() => {
          if (self.state.refetchEnabled && isMounted && document.visibilityState === 'visible') {
            self._refetch();
          } else if (self.state.refetchEnabled && isMounted && document.visibilityState !== 'visible') {
            self.setState({ refetchForcePaused: true });
          }
        }, 5000);
      },
      {
        cursor,
      },
    );
  }
  /**
  *  @param {}
  *  pagination container loads more items
  */
  _loadMore() {
    const self = this;

    pagination = true;

    this.setState({
      isPaginating: true,
    });

    this.props.relay.loadMore(
      5, // Fetch the next 5 feed items
      (error) => {
        if (error) {
          console.error(error);
        }

        if ((this.props.labbook.activityRecords.pageInfo.hasNextPage) && (this._countUnexpandedRecords() < 7) && (this._countUnexpandedRecords() > 2)) {
          self._loadMore();
        } else {
          this.setState({
            isPaginating: false,
          });
        }
      }, {
        name: 'labbook',
      },
    );
    if (this.props.labbook.activityRecords.pageInfo.hasNextPage) {
      counter += 5;
    }
  }

  /**
  *  @param {}
  *  counts visible non clustered activity records
  */
  _countUnexpandedRecords() {
    let records = this.props.labbook.activityRecords.edges,
      hiddenCount = 0,
      recordCount = 0;

    const visibleRecords = records.filter((record) => {
      if (record) {
        if (!record.node.show) {
          hiddenCount++;
        } else if (hiddenCount > 2) {
          hiddenCount = 0;
          recordCount++;
        }
      }

      return record && record.node && record.node.show;
    });

    if (hiddenCount > 0) {
      recordCount++;
    }

    return visibleRecords.length + recordCount;
  }
  /**
    *  @param {}
    *   determines value of stickyDate by checking vertical offset and assigning it to the state
    *
  */
  _setStickyDate() {
    let isDemo = window.location.hostname === config.demoHostName,
      upperBound = isDemo ? 170 : 120,
      lowerBound = isDemo ? 130 : 80,
      isExpanded = (window.pageYOffset < this.offsetDistance) && (window.pageYOffset > upperBound),
      stickyDate = null;

    this.offsetDistance = window.pageYOffset;

    this.dates.forEach((date) => {
      if (date && date.e) {
        const bounds = date.e.getBoundingClientRect();

        if ((!isExpanded && bounds.top < lowerBound) || (isExpanded && bounds.top < upperBound)) {
          stickyDate = date.time;
          date.e.classList.add('not-visible');
          date.e.nextSibling && date.e.nextSibling.classList.add('next-element');
        } else {
          date.e.classList.remove('not-visible');
          date.e.nextSibling && date.e.nextSibling.classList.remove('next-element');
        }
      }
    });

    if (stickyDate !== this.state.stickyDate) {
      this.setState({ stickyDate });
    }
  }
  /**
  *  @param {evt}
  *   handles scolls and passes off loading to pagination container
  *
  */
  _handleScroll(evt) {
    this._setStickyDate();

    let { isPaginating } = this.state,
      activityRecords = this.props.labbook.activityRecords,
      root = document.getElementById('root'),
      distanceY = window.innerHeight + document.documentElement.scrollTop + 1000,
      expandOn = root.scrollHeight;


    if ((distanceY > expandOn) && !isPaginating && activityRecords.pageInfo.hasNextPage) {
      this._loadMore(evt);
    }

    if ((distanceY > 3000)) {
      this._stopRefetch();
    } else {
      this._startRefetch();
    }
  }
  /**
  *   @param {array}
  *   loops through activityRecords array and sorts into days
  *   @return {Object}
  */
  _transformActivity(activityRecords) {
    let activityTime = {},
      count = 0,
      previousTimeHash = null;

    activityRecords.edges.forEach((edge, index) => {
      if (edge && edge.node) {
        const date = (edge.node && edge.node.timestamp) ? new Date(edge.node.timestamp) : new Date();
        const timeHash = `${date.getFullYear()}_${date.getMonth()}_${date.getDate()}`;
        count = edge.node.show || (previousTimeHash && timeHash !== previousTimeHash) ? 0 : count + 1;
        previousTimeHash = timeHash;

        const isExpandedHead = this.state && this.state.expandedClusterObject.has(index) && !this.state.expandedClusterObject.has(index - 1);
        const isExpandedEnd = this.state && this.state.expandedClusterObject.has(index) && !this.state.expandedClusterObject.has(index + 1);
        const isExpandedNode = this.state && this.state.expandedClusterObject.has(index);
        const attachedCluster = this.state && this.state.expandedClusterObject.has(index) && this.state.expandedClusterObject.get(index);

        const newActivityObject = {
          edge, date, collapsed: (count > 2 && ((this.state && !this.state.expandedClusterObject.has(index)) || (!this.state))), flatIndex: index, isExpandedHead, isExpandedEnd, isExpandedNode, attachedCluster,
        };

        if (count > 2 && ((this.state && !this.state.expandedClusterObject.has(index)) || (!this.state))) {
          activityTime[timeHash][activityTime[timeHash].length - 1].collapsed = true;
          activityTime[timeHash][activityTime[timeHash].length - 2].collapsed = true;
        }

        activityTime[timeHash] ? activityTime[timeHash].push(newActivityObject) : activityTime[timeHash] = [newActivityObject];
      }
    });

    return activityTime;
  }
  /**
  *   @param {}
  *   toggles activity visibility
  *   @return {}
  */
  _toggleActivity() {
    this.setState({
      modalVisible: !this.state.modalVisible,
    });
  }
  /**
  *   @param {}
  *   hides add activity
  *   @return {}
  */
  _hideAddActivity() {
    this.setState({
      modalVisible: false,
    });
  }
  /**
  *   @param {}
  *   hides add activity
  *   @return {}
  */
  _toggleRollbackMenu(node) {
    const { status } = store.getState().containerStatus;
    const canEditEnvironment = config.containerStatus.canEditEnvironment(status);
    if (canEditEnvironment) {
      this.setState({ selectedNode: node, createBranchVisible: true });
    } else {
      setContainerMenuWarningMessage('Stop Project before editing the environment. \n Be sure to save your changes.');
    }
  }

  /**
  *   @param {}
  *   toggle create branch modal visibility
  *   @return {}
  */

  _toggleCreateModal() {
    this.setState({ createBranchVisible: !this.state.createBranchVisible });
  }

  /**
  *   @param {}
  *   opens create branch modal and also sets selectedNode to null
  *   @return {}
  */
  _createBranch() {
    const { status } = store.getState().containerStatus;
    const canEditEnvironment = config.containerStatus.canEditEnvironment(status);
    if (canEditEnvironment) {
      this.setState({ createBranchVisible: true, selectedNode: null });
    } else {
      setContainerMenuWarningMessage('Stop Project before creating branches. \n Be sure to save your changes.');
    }
  }

  /**
  *   @param {boolean} isFullscreen
  *   Changes editorFullscreen in state to true if isFullscreen is true, else it swaps existing state
  *   @return {}
  */
  _changeFullscreenState(isFullscreen) {
    if (isFullscreen) {
      this.setState({ editorFullscreen: isFullscreen });
    } else {
      this.setState({ editorFullscreen: !this.state.editorFullscreen });
    }
  }

  /**
  *   @param {array} clusterElements
  *   modifies expandedClusterObject from state
  *   @return {}
  */
  _deleteCluster(clusterElements) {
    const newExpandedClusterObject = new Map(this.state.expandedClusterObject);
    if (newExpandedClusterObject !== {}) {
      clusterElements.forEach((val) => {
        newExpandedClusterObject.set(val, clusterElements);
      });
    }
    this.setState({ expandedClusterObject: newExpandedClusterObject }, () => {
      this.setState({ activityRecords: this._transformActivity(this.props.labbook.activityRecords) });
    });
  }

  /**
    *   @param {array} clusterElements
    *   modifies expandedClusterObject from state
    *   @return {}
  */
  _addCluster(clusterElements) {
    const newExpandedClusterObject = new Map(this.state.expandedClusterObject);
    if (newExpandedClusterObject !== {}) {
      clusterElements.forEach((val) => {
        newExpandedClusterObject.delete(val);
      });
    }
    this.setState({ expandedClusterObject: newExpandedClusterObject }, () => {
      this.setState({ activityRecords: this._transformActivity(this.props.labbook.activityRecords) });
      this._compressExpanded(clusterElements, true);
    });
  }

  _compressExpanded(clusterElements, remove) {
    const newCompressedElements = new Set(this.state.compressedElements);
    if (remove) {
      clusterElements.forEach((val) => {
        newCompressedElements.delete(val);
      });
    } else {
      clusterElements.forEach((val) => {
        newCompressedElements.add(val);
      });
    }
    this.setState({ compressedElements: newCompressedElements });
  }

  /**
  *   @param {event} evt
  *   assigns open-menu class to parent element and ActivityExtended to previous element
  *   @return {}
  */
  _toggleSubmenu(evt) {
    const submenu = evt.target.parentElement;
    const wrapper = submenu && submenu.parentElement;
    if (wrapper.previousSibling) {
      wrapper.previousSibling.className.indexOf('ActivityExtended') !== -1 ? wrapper.previousSibling.classList.remove('ActivityExtended') : wrapper.previousSibling.classList.add('ActivityExtended');
    } else {
      wrapper.parentElement.previousSibling.className.indexOf('ActivityExtended') !== -1 ? wrapper.parentElement.previousSibling.classList.remove('ActivityExtended') : wrapper.parentElement.previousSibling.classList.add('ActivityExtended');
    }
    submenu.className.indexOf('open-menu') !== -1 ? submenu.classList.remove('open-menu') : submenu.classList.add('open-menu');
  }

  /**
  *   @param {object, array, integer, integer, integer} obj, clusterElements, i, j, k
  *   resets clusterElements
  *   returns visible activity cards and their submenus
  *   @return {jsx}
  */

  _visibleCardRenderer(obj, clusterElements, i, j, k) {
    const isLastRecordObj = i === Object.keys(this.state.activityRecords).length - 1;
    const isLastRecordNode = j === this.state.activityRecords[k].length - 1;
    const isLastPage = !this.props.labbook.activityRecords.pageInfo.hasNextPage;
    const rollbackableDetails = obj.edge.node.detailObjects.filter(detailObjs => detailObjs.type !== 'RESULT' && detailObjs.type !== 'CODE_EXECUTED');
    const isCompressed = this.state.compressedElements.has(obj.flatIndex);
    return (
      <Fragment key={obj.edge.node.id}>
        <div className="ActivityCard__wrapper">
          { ((i !== 0) || (j !== 0)) &&
            <div className="Activity__submenu-container">
              {
              (!(isLastRecordObj && isLastRecordNode && isLastPage) && this.props.isMainWorkspace && !!rollbackableDetails.length) && this.state.compressedElements.size === 0 &&
              <Fragment>
                <ToolTip section="activitySubmenu" />
                <div
                  className="Activity__submenu-circle"
                  onClick={evt => this._toggleSubmenu(evt)}
                />
                <div className="Activity__submenu-subcontainer">
                  <div
                    className="Activity__rollback"
                    onMouseOver={() => this.setState({ hoveredRollback: obj.flatIndex })}
                    onMouseOut={() => this.setState({ hoveredRollback: null })}
                    onClick={() => this._toggleRollbackMenu(obj.edge.node)}
                  >
                    <button
                      className="Activity__rollback-button"
                    />
                    <h5
                      className="Activity__rollback-text"
                    >
                      Rollback
                    </h5>
                  </div>
                </div>
              </Fragment>
            }
            </div>
          }
          {j === 0 && isCompressed &&
            <div className="Activity__submenu--flat">&nbsp;</div>
          }
          {
            obj.isExpandedHead && isCompressed &&
              <div className="Activity__compressed-bar--top" style={{ height: `${((obj.attachedCluster.length - 1) * 7.5) + 30}px` }} />
          }
          {
            obj.isExpandedEnd && isCompressed &&
              <div className="Activity__compressed-bar--bottom" style={{ height: `${((obj.attachedCluster.length - 1) * 7.5) + 30}px` }} />
          }
          <ErrorBoundary type="activityCardError" key={`activityCard${obj.edge.node.id}`}>
            <ActivityCard
              isFirstCard={j === 0}
              addCluster={this._addCluster}
              compressExpanded={this._compressExpanded}
              isCompressed={isCompressed}
              isExpandedHead={obj.isExpandedHead}
              isExpandedEnd={obj.isExpandedEnd}
              isExpandedNode={obj.isExpandedNode}
              attachedCluster={obj.attachedCluster}
              collapsed={obj.collapsed}
              clusterObject={this.state.clusterObject}
              position={obj.flatIndex}
              hoveredRollback={this.state.hoveredRollback}
              key={`${obj.edge.node.id}_activity-card`}
              edge={obj.edge}
            />
          </ErrorBoundary>
        </div>
        {(j === this.state.activityRecords[k].length - 1) && isCompressed &&
          <div className="Activity__submenu--flat">&nbsp;</div>
        }
      </Fragment>
    );
  }

  /**
  *   @param {object, array, integer, integer, integer} obj, clusterElements, i, j, k
  *   appends to clusterElements
  *   creates a cluster card that replaces multiple repeating minor activities
  *   @return {jsx}
  */
  _cardClusterRenderer(obj, clusterElements, i, j, k) {
    const shouldBeFaded = this.state.hoveredRollback > obj.flatIndex;
    const clusterCSS = classNames({
      'ActivityCard--cluster': true,
      'column-1-span-10': true,
      faded: shouldBeFaded,
    });
    clusterElements.push(obj.flatIndex);
    const clusterRef = clusterElements.slice();
    if (this.state.activityRecords[k][j + 1] && this.state.activityRecords[k][j + 1].collapsed) {
      return undefined;
    }
    return (
      <div className="ActivityCard__wrapper" key={obj.flatIndex}>
        {
        (clusterElements[0] !== 0) &&
        <div className="Activity__submenu-container" />
      }
        <ToolTip section="activityCluster" />
        <div className={clusterCSS} ref={`cluster--${obj.flatindex}`} onClick={() => this._deleteCluster(clusterRef, i)}>
          <div className="ActivityCard__cluster--layer1">
            {clusterElements.length} Minor Activities
          </div>
          <div className="ActivityCard__cluster--layer2" />
          <div className="ActivityCard__cluster--layer3" />
        </div>
      </div>
    );
  }

  /**
  *   @param {} obj
  *   renders usernote and it's menu
  *   @return {jsx}
  */

  _renderUserNote() {
    const userActivityContainerCSS = classNames({
      UserActivity__container: true,
      fullscreen: this.state.editorFullscreen,
    });
    return (
      <div className={userActivityContainerCSS}>
        <div className="Activity__user-note">
          <ToolTip section="userNote" />
          <div
            className="Activity__user-note-menu-icon"
            onClick={this.state.modalVisible ? (evt) => {
            this._toggleActivity();
            this._toggleSubmenu(evt);
          } : evt => this._toggleSubmenu(evt)}
          />
          <div className="Activity__user-note-menu">
            <div className="Activity__add-note">
              <button
                className={this.state.modalVisible ? 'Activity__hide-note-button' : 'Activity__add-note-button'}
                onClick={() => this._toggleActivity()}
              />
              <h5>Add Note</h5>
            </div>
            <div className="Activity__add-branch">
              <button
                className="Activity__add-branch-button"
                onClick={() => this._createBranch()}
              />
              <h5>Add Branch</h5>
            </div>
          </div>
        </div>
        <div className={this.state.modalVisible ? 'Activity__add ActivityCard' : 'hidden'}>
          <UserNote
            key="UserNote"
            labbookId={this.props.labbook.id}
            hideLabbookModal={this._hideAddActivity}
            changeFullScreenState={this._changeFullscreenState}
            {...this.props}
          />
        </div>
      </div>
    );
  }

  render() {
    const activityCSS = classNames({
      Activity: true,
      fullscreen: this.state.editorFullscreen,
    });
    const newActivityCSS = classNames({
      'Activity__new-record box-shadow': true,
      'is-demo': window.location.hostname === config.demoHostName,
    });

    if (this.props.labbook) {
      const recordDates = Object.keys(this.state.activityRecords);
      const stickyDateCSS = classNames({
        'Activity__date-tab': true,
        fixed: this.state.stickyDate,
        'is-expanded': store.getState().labbook.isExpanded,
        'is-demo': window.location.hostname === config.demoHostName,
      });
      return (
        <div key={this.props.labbook} className={activityCSS}>
          {
            (!this.state.refetchEnabled && this.state.newActivityAvailable) &&
            <div
              className="Activity__new-record-wrapper column-1-span-10"
            >
              <div
                onClick={() => this._getNewActivities()}
                className={newActivityCSS}
              >
                New Activity
              </div>
           §</div>
          }
          {
            this.state.stickyDate &&
            <div className={stickyDateCSS}>
              <div className="Activity__date-day">{this.state.stickyDate.split('_')[2]}</div>
              <div className="Activity__date-sub">

                <div className="Activity__date-month">
                  {
                    config.months[parseInt(this.state.stickyDate.split('_')[1], 10)]
                  }
                </div>

                <div className="Activity__date-year">{this.state.stickyDate.split('_')[0]}</div>
              </div>
            </div>

          }

          <div
            key={`${this.props.labbook}_labbooks__container`}
            className="Activity__inner-container flex flex--row flex--wrap justify--flex-start"
          >
            <div
              key={`${this.props.labbook}_labbooks__labook-id-container`}
              className="Activity__sizer flex-1-0-auto"
            >

              <CreateBranch
                ref="createBranch"
                selected={this.state.selectedNode}
                activeBranch={this.props.activeBranch}
                modalVisible={this.state.createBranchVisible}
                toggleModal={this._toggleCreateModal}
                setBuildingState={this.props.setBuildingState}
              />

              {
                recordDates.map((k, i) => {
                  let clusterElements = [];
                  const ActivityDateCSS = classNames({
                    'Activity__date-tab': true,
                    note: (i === 0),
                  });
                  const ActivityContainerCSS = classNames({
                    'Activity__card-container': true,
                    'Activity__card-container--last': recordDates.length === i + 1,
                  });
                  return (
                    <div key={k}>
                      <div ref={evt => this.dates[i] = { e: evt, time: k }} className={ActivityDateCSS}>
                        <div className="Activity__date-day">{k.split('_')[2]}</div>
                        <div className="Activity__date-sub">
                          <div className="Activity__date-month">{ config.months[parseInt(k.split('_')[1], 10)] }</div>
                          <div className="Activity__date-year">{k.split('_')[0]}</div>
                        </div>
                      </div>
                      {
                        (i === 0) && this._renderUserNote()
                      }
                      <div key={`${k}__card`} className={ActivityContainerCSS}>
                        {
                          this.state.activityRecords[k].map((obj, j) => {
                            if (!obj.collapsed) {
                              clusterElements = [];
                              return this._visibleCardRenderer(obj, clusterElements, i, j, k);
                            }
                              return this._cardClusterRenderer(obj, clusterElements, i, j, k);
                          })
                        }
                      </div>
                    </div>);
                })
              }
              {
                Array(5).fill(1).map((value, index) => (
                  <PaginationLoader
                    key={`Actvity_paginationLoader${index}`}
                    index={index}
                    isLoadingMore={this.state.isPaginating}
                  />
                  ))
              }
            </div>
          </div>
        </div>
      );
    }
    return (
      <Loader />
    );
  }
}

/*
  activity pagination container
  contains activity fragment and for query consumption
*/
export default createPaginationContainer(
  Activity,
  {
    labbook: graphql`
      fragment Activity_labbook on Labbook{
        activityRecords(first: $first, after: $cursor) @connection(key: "Activity_activityRecords"){
          edges{
            node{
              id
              commit
              linkedCommit
              type
              show
              importance
              tags
              message
              timestamp
              username
              detailObjects{
                id
                key
                show
                importance
                type
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
      }`,
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.labbook && props.labbook.activityRecords;
    },
    getFragmentVariables(prevVars, first, cursor) {
      return {
        ...prevVars,
        first,
      };
    },
    getVariables(props, { count, cursor }, fragmentVariables) {
      const { owner } = props.match.params;
      const name = props.match.params.labbookName;
      const first = counter;

      cursor = pagination ? props.labbook.activityRecords.edges[props.labbook.activityRecords.edges.length - 1].cursor : null;

      return {
        first,
        cursor,
        name,
        owner,
        // in most cases, for variables other than connection filters like
        // `first`, `after`, etc. you may want to use the previous values.
        // orderBy: fragmentVariables.orderBy,
      };
    },
    query: graphql`
     query ActivityPaginationQuery($name: String!, $owner: String!, $first: Int!, $cursor: String){
       labbook(name: $name, owner: $owner){
         id
         description
         ...Activity_labbook
       }
     }`,

  },
);

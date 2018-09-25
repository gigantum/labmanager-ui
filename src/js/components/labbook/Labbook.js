// vendor
import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import {
  createFragmentContainer,
  graphql,
} from 'react-relay';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import classNames from 'classnames';
import { connect } from 'react-redux';
import Loadable from 'react-loadable';
// store
import store from 'JS/redux/store';
import { setContainerMenuWarningMessage } from 'JS/redux/reducers/labbook/environment/environment';
import { setMergeMode, setBuildingState, setStickyDate } from 'JS/redux/reducers/labbook/labbook';
import { setCallbackRoute } from 'JS/redux/reducers/routes';
import { setLatestPackages } from 'JS/redux/reducers/labbook/environment/packageDependencies';
// components
import LabbookHeader from './labbookHeader/LabbookHeader';
import Login from 'Components/login/Login';
import Loader from 'Components/shared/Loader';
import ErrorBoundary from 'Components/shared/ErrorBoundary';
// utils
import { getFilesFromDragEvent } from 'JS/utils/html-dir-content';
// assets
import './Labbook.scss';

import Config from 'JS/config';

const Loading = () => <Loader />;

const Overview = Loadable({
  loader: () => import('./overview/Overview'),
  loading: Loading,
  delay: 500,
});
const Activity = Loadable({
  loader: () => import('./activity/Activity'),
  loading: Loading,
  delay: 500,
});
const Code = Loadable({
  loader: () => import('./code/Code'),
  loading: Loading,
  delay: 500,
});
const InputData = Loadable({
  loader: () => import('./inputData/InputData'),
  loading: Loading,
  delay: 500,
});
const OutputData = Loadable({
  loader: () => import('./outputData/OutputData'),
  loading: Loading,
  delay: 500,
});
const Environment = Loadable({
  loader: () => import('./environment/Environment'),
  loading: Loading,
  delay: 500,
});

class Labbook extends Component {
  constructor(props) {
  	super(props);

    localStorage.setItem('owner', store.getState().routes.owner);

    // bind functions here
    this._setBuildingState = this._setBuildingState.bind(this);
    this._toggleBranchesView = this._toggleBranchesView.bind(this);
    this._branchViewClickedOff = this._branchViewClickedOff.bind(this);
    setCallbackRoute(props.location.pathname);
  }

  UNSAFE_componentWillMount() {
    const { labbookName, owner } = store.getState().routes;
    document.title = `${owner}/${labbookName}`;
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    setCallbackRoute(nextProps.location.pathname);
  }

  /**
    @param {}
    subscribe to store to update state
    set unsubcribe for store
  */
  componentDidMount() {
    this._setStickHeader();

    window.addEventListener('scroll', this._setStickHeader);
    window.addEventListener('click', this._branchViewClickedOff);
  }

  /**
    @param {}
    removes event listeners
  */
  componentWillUnmount() {
    setLatestPackages({});

    window.removeEventListener('scroll', this._setStickHeader);

    window.removeEventListener('click', this._branchViewClickedOff);
  }

  /**
    @param {event}
    updates state of labbook when prompted ot by the store
    updates history prop
  */
  _branchViewClickedOff(evt) {
    if (evt.target.className.indexOf('Labbook__veil') > -1) {
      this._toggleBranchesView(false, false);
    }
  }

  /**
    @param {string}
    makes branch name pretty
    @return {string}
  */
  _sanitizeBranchName(branchName) {
    const username = localStorage.getItem('username');
    const workspace = `gm.workspace-${username}`;

    if (branchName) {
      const prettyBranchName = (branchName === workspace) ? 'workspace' : branchName.replace(`${workspace}.`, '');

      return prettyBranchName;
    }
  }

  /**
    @param {}
    dispatches sticky state to redux to update state
  */
  _setStickHeader() {
    const isExpanded = (window.pageYOffset < this.offsetDistance) && (window.pageYOffset > 120);
    this.offsetDistance = window.pageYOffset;
    const sticky = 50;
    const isSticky = window.pageYOffset >= sticky;
    if ((store.getState().labbook.isSticky !== isSticky) || (store.getState().labbook.isExpanded !== isExpanded)) {
      setStickyDate(isSticky, isExpanded);
    }

    if (isSticky) {
      setMergeMode(false, false);
    }
  }

  /**
    @param {boolean} isBuilding
    updates container status state
    updates labbook state
  */
  _setBuildingState = (isBuilding) => {
    this.refs.ContainerStatus && this.refs.ContainerStatus.setState({ isBuilding });

    if (this.props.isBuilding !== isBuilding) {
      setBuildingState(isBuilding);
    }
  }

  /**
    @param {boolean, boolean}
    updates branchOpen state
  */
  _toggleBranchesView(branchesOpen, mergeFilter) {
    if (store.getState().containerStatus.status !== 'Running') {
      setMergeMode(branchesOpen, mergeFilter);
    } else {
      setContainerMenuWarningMessage('Stop Project before switching branches. \n Be sure to save your changes.');
    }
  }
  /**
    scrolls to top of window
  */
  _scrollToTop() {
    window.scrollTo(0, 0);
  }

  render() {
    const { isAuthenticated } = this.props.auth;
    const isLockedBrowser = {
      locked: (this.props.isPublishing || this.props.isSyncing || this.props.isExporting), isPublishing: this.props.isPublishing, isExporting: this.props.isExporting, isSyncing: this.props.isSyncing,
    };
    const isLockedEnvironment = this.props.isBuilding || this.props.isSyncing || this.props.isPublishing;

    if (this.props.labbook) {
      const { labbook, branchesOpen } = this.props;
      const branchName = this._sanitizeBranchName(this.props.labbook.activeBranchName);

      const labbookCSS = classNames({
        Labbook: true,
        'Labbook--detail-mode': this.props.detailMode,
        'Labbook--branch-mode': branchesOpen,
        'Labbook--demo-mode': window.location.hostname === Config.demoHostName,
      });

      return (
        <div className={labbookCSS}>

          <div className="Labbook__spacer flex flex--column">


            <LabbookHeader
              setBuildingState={this._setBuildingState}
              toggleBranchesView={this._toggleBranchesView}
              branchName={branchName}
              {...this.props}
            />

            <div className="Labbook__routes flex flex-1-0-auto">

              <Switch>
                <Route
                  exact
                  path={`${this.props.match.path}`}
                  render={() => (
                    <ErrorBoundary type="labbookSectionError">

                      <Overview
                        key={`${this.props.labbookName}_overview`}
                        labbook={labbook}
                        description={labbook.description}
                        labbookId={labbook.id}
                        setBuildingState={this._setBuildingState}
                        readme={labbook.readme}
                        isSyncing={this.props.isSyncing}
                        isPublishing={this.props.isPublishing}
                        scrollToTop={this._scrollToTop}
                      />

                    </ErrorBoundary>
                        )}
                />

                <Route path={`${this.props.match.path}/:labbookMenu`}>

                  <Switch>

                    <Route
                      path={`${this.props.match.path}/overview`}
                      render={() => (

                        <ErrorBoundary
                          type="labbookSectionError"
                          key="overview"
                        >

                          <Overview
                               key={`${this.props.labbookName}_overview`}
                               labbook={labbook}
                               description={labbook.description}
                               labbookId={labbook.id}
                               setBuildingState={this._setBuildingState}
                               readme={labbook.readme}
                               isSyncing={this.props.isSyncing}
                               isPublishing={this.props.isPublishing}
                               scrollToTop={this._scrollToTop}
                             />

                        </ErrorBoundary>
                            )}
                    />

                    <Route
                      path={`${this.props.match.path}/activity`}
                      render={() => (
                        <ErrorBoundary
                          type="labbookSectionError"
                          key="activity"
                        >

                          <Activity
                               key={`${this.props.labbookName}_activity`}
                               labbook={labbook}
                               activityRecords={this.props.activityRecords}
                               labbookId={labbook.id}
                               activeBranch={labbook.activeBranch}
                               isMainWorkspace={branchName === 'workspace'}
                               setBuildingState={this._setBuildingState}
                               {...this.props}
                             />

                        </ErrorBoundary>
                          )}
                    />

                    <Route
                      path={`${this.props.match.url}/environment`}
                      render={() => (
                        <ErrorBoundary
                          type="labbookSectionError"
                          key="environment"
                        >

                          <Environment
                               key={`${this.props.labbookName}_environment`}
                               labbook={labbook}
                               labbookId={labbook.id}
                               setBuildingState={this._setBuildingState}
                               containerStatus={this.refs.ContainerStatus}
                               overview={labbook.overview}
                               isLocked={isLockedEnvironment}
                               {...this.props}
                             />

                        </ErrorBoundary>)}
                    />

                    <Route
                      path={`${this.props.match.url}/code`}
                      render={() => (
                        <ErrorBoundary
                          type="labbookSectionError"
                          key="code"
                        >

                          <Code
                               labbook={labbook}
                               labbookId={labbook.id}
                               setContainerState={this._setContainerState}
                               isLocked={isLockedBrowser}
                             />

                        </ErrorBoundary>)}
                    />

                    <Route
                      path={`${this.props.match.url}/inputData`}
                      render={() => (
                        <ErrorBoundary
                          type="labbookSectionError"
                          key="input"
                        >

                          <InputData
                               labbook={labbook}
                               labbookId={labbook.id}
                               isLocked={isLockedBrowser}
                             />

                        </ErrorBoundary>)}
                    />

                    <Route
                      path={`${this.props.match.url}/outputData`}
                      render={() => (
                        <ErrorBoundary
                          type="labbookSectionError"
                          key="output"
                        >

                          <OutputData
                               labbook={labbook}
                               labbookId={labbook.id}
                               isLocked={isLockedBrowser}
                             />

                        </ErrorBoundary>)}
                    />

                  </Switch>

                </Route>

              </Switch>

            </div>

          </div>

          <div className="Labbook__veil" />

        </div>);
    }

    if (isAuthenticated()) {
      return (<Loader />);
    }

    return (<Login auth={this.props.auth} />);
  }
}

const mapStateToProps = (state, ownProps) => state.labbook;

const mapDispatchToProps = dispatch => ({
});

const LabbookContainer = connect(mapStateToProps, mapDispatchToProps)(Labbook);


const LabbookFragmentContainer = createFragmentContainer(
  LabbookContainer,
  {
    labbook: graphql`
      fragment Labbook_labbook on Labbook{
          id
          description
          readme
          defaultRemote
          owner
          creationDateUtc
          visibility

          environment{
            containerStatus
            imageStatus
            base{
              developmentTools
            }
          }

          overview{
            remoteUrl
            numAptPackages
            numConda2Packages
            numConda3Packages
            numPipPackages
          }


          availableBranchNames
          mergeableBranchNames
          workspaceBranchName
          activeBranchName

          ...Environment_labbook
          ...Overview_labbook
          ...Activity_labbook
          ...Code_labbook
          ...InputData_labbook
          ...OutputData_labbook

      }`,
  },

);

const backend = (manager: Object) => {
  const backend = HTML5Backend(manager),
    orgTopDropCapture = backend.handleTopDropCapture;

  backend.handleTopDropCapture = (e) => {
    if (backend.currentNativeSource) {
      orgTopDropCapture.call(backend, e);

      backend.currentNativeSource.item.dirContent = getFilesFromDragEvent(e, { recursive: true }); // returns a promise
    }
  };

  return backend;
};

export default DragDropContext(backend)(LabbookFragmentContainer);

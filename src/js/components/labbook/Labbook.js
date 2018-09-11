//vendor
import React, { Component } from 'react'
import { Route , Switch, Link} from 'react-router-dom';
import {
  createFragmentContainer,
  graphql
} from 'react-relay'
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import classNames from 'classnames'
import { connect } from 'react-redux'
//store
import store from "JS/redux/store"
//components
import ContainerStatus from './containerStatus/ContainerStatus'
import Login from 'Components/login/Login';
import Activity from './activity/Activity'
import Code from './code/Code'
import InputData from './inputData/InputData'
import OutputData from './outputData/OutputData'
import Overview from './overview/Overview'
import Environment from './environment/Environment'
import Loader from 'Components/shared/Loader'
import Branches from './branches/Branches'
import BranchMenu from './branchMenu/BranchMenu'
import ToolTip from 'Components/shared/ToolTip';
import ErrorBoundary from 'Components/shared/ErrorBoundary'
//utils
import {getFilesFromDragEvent} from "JS/utils/html-dir-content";

import Config from 'JS/config'

class Labbook extends Component {
  constructor(props){
  	super(props);

    localStorage.setItem('owner', store.getState().routes.owner)

    //bind functions here
    this._setSelectedComponent = this._setSelectedComponent.bind(this)
    this._setBuildingState = this._setBuildingState.bind(this)
    this._showLabbookModal = this._showLabbookModal.bind(this)
    this._hideLabbookModal = this._hideLabbookModal.bind(this)
    this._toggleBranchesView = this._toggleBranchesView.bind(this)
    this._branchViewClickedOff = this._branchViewClickedOff.bind(this)

    store.dispatch({
      type: 'UPDATE_CALLBACK_ROUTE',
      payload: {
        'callbackRoute': props.history.location.pathname
      }
    })
  }

  UNSAFE_componentWillMount() {
    const {labbookName, owner} = store.getState().routes
    document.title = `${owner}/${labbookName}`
  }

  UNSAFE_componentWillReceiveProps(nextProps) {

    store.dispatch({
      type: 'UPDATE_CALLBACK_ROUTE',
      payload: {
        'callbackRoute': nextProps.history.location.pathname
      }
    })
  }
  /**
    @param {}
    subscribe to store to update state
    set unsubcribe for store
  */
  componentDidMount() {
    this._setStickHeader();
    window.addEventListener('scroll', this._setStickHeader)
    window.addEventListener('click', this._branchViewClickedOff )
  }
  /**
    @param {}
    removes event listeners
  */
  componentWillUnmount() {
    store.dispatch({
      type: 'SET_LATEST_PACKAGES',
      payload: {
        latestPackages: {}
      }
    })
    window.removeEventListener('scroll', this._setStickHeader)

    window.removeEventListener('click', this._branchViewClickedOff)

  }
  /**
    @param {event}
    updates state of labbook when prompted ot by the store
    updates history prop
  */
  _branchViewClickedOff(evt) {
    if(evt.target.className.indexOf('Labbook__veil') > -1) {
      this._toggleBranchesView(false, false);
    }
  }

  /**
    @param {}
    dispatches sticky state to redux to update state
  */
  _setStickHeader(){
    let isExpanded = (window.pageYOffset < this.offsetDistance) && (window.pageYOffset > 120)
    this.offsetDistance = window.pageYOffset;
    let sticky = 50;
    let isSticky = window.pageYOffset >= sticky
    if((store.getState().labbook.isSticky !== isSticky) || (store.getState().labbook.isExpanded !== isExpanded)) {
      store.dispatch({
        type: 'UPDATE_STICKY_STATE',
        payload: {
          isSticky,
          isExpanded
        }
      })
    }

    if(isSticky){
      store.dispatch({
        type: 'MERGE_MODE',
        payload: {
          brancfahesOpen: false,
          mergeFilter: false
        }
      })
    }
  }
  /**
    @param {string} componentName - input string componenetName
    updates state of selectedComponent
    updates history prop
  */
  _setSelectedComponent = (componentName) =>{
    if(componentName !== this.props.selectedComponent){
      if(store.getState().detailView.selectedComponent === true){
        store.dispatch({
          type: 'UPDATE_DETAIL_VIEW',
          payload: {
            detailMode: false
          }
        })

      }
    }
  }
  /**
    @param {boolean} isBuilding
    updates container status state
    updates labbook state
  */
  _setBuildingState = (isBuilding) =>{
    this.refs['ContainerStatus'] && this.refs['ContainerStatus'].setState({'isBuilding': isBuilding})

    if(this.props.isBuilding !== isBuilding){
      store.dispatch(
        {type: 'IS_BUILDING',
        payload:{
          'isBuilding': isBuilding
        }
      })
    }
  }

  /**
  @param {boolean} isSyncing
  updates container status state
  updates labbook state
*/
  _setSyncingState = (isSyncing) => {
    this.refs['ContainerStatus'] && this.refs['ContainerStatus'].setState({ 'isSyncing': isSyncing })

    if (this.props.isSyncing !== isSyncing) {
      store.dispatch(
        {
          type: 'IS_SYNCING',
          payload: {
            'isSyncing': isSyncing
          }
        })
    }
  }

  /**
    @param {boolean} isPublishing
    updates container status state
    updates labbook state
  */
 _setPublishingState = (isPublishing) => {

    this.refs['ContainerStatus'] && this.refs['ContainerStatus'].setState({ 'isPublishing': isPublishing })

    if (this.props.isPublishing !== isPublishing) {
      store.dispatch(
        {
          type: 'IS_PUBLISHING',
          payload: {
            'isPublishing': isPublishing
          }
        })
    }
  }

  /**
    @param {boolean} isExporting
    updates container status state
    updates labbook state
  */
  _setExportingState = (isExporting) => {

    this.refs['ContainerStatus'] && this.refs['ContainerStatus'].setState({ 'isExporting': isExporting })

    if (this.props.isExporting !== isExporting) {
      store.dispatch(
        {
          type: 'IS_EXPORTING',
          payload: {
            'isExporting': isExporting
          }
        })
    }
  }


  /**
    @param {object} item
    returns nav jsx
  */

  _changeSlider() {
    let pathArray = this.props.location.pathname.split('/')
    let selectedPath = (pathArray.length > 4 ) ? pathArray[pathArray.length - 1] : 'overview'
    let defaultOrder = ['overview', 'activity', 'environment', 'code', 'inputData', 'outputData'];
    let selectedIndex = defaultOrder.indexOf(selectedPath);
    return (
      <hr className={' Labbook__navigation-slider Labbook__navigation-slider--' + selectedIndex}/>
    )
  }

  _getNavItem(item, index){
    let pathArray = this.props.location.pathname.split('/')
    let selectedPath = (pathArray.length > 4 ) ? pathArray[pathArray.length - 1] : 'overview' // sets avtive nav item to overview if there is no menu item in the url
    let liCSS = classNames({
      'selected': selectedPath === item.id,
      ['Labbook__navigation-item Labbook__navigation-item--' + item.id]: !selectedPath !== item.id,
      ['Labbook__navigation-item--' + index]: true,
    });
    return (
      <li
        id={item.id}
        key={item.id}
        className={liCSS}
        onClick={()=> this._setSelectedComponent(item.id)}
        >
        <Link
          onClick={this._scrollToTop}
          to={`../../../projects/${this.props.owner}/${this.props.match.params.labbookName}/${item.id}`}
          replace
        >
          {item.name}
        </Link>
      </li>
    )
  }
  /**
    @param {}
    updates html element classlist and labbook state
  */
  _showLabbookModal = () => {
    if(!this.props.modalVisible){
      store.dispatch(
        {
          type: 'MODAL_VISIBLE',
          payload:{
            'modalVisible': true
          }
      })
    }

  }
  /**
    @param {}
    updates html element classlist and labbook state
  */
  _hideLabbookModal = () => {

    if(document.getElementById('labbookModal')){
      document.getElementById('labbookModal').classList.add('hidden')
    }

    if(document.getElementById('modal__cover')){
      document.getElementById('modal__cover').classList.add('hidden')
    }

    if(this.props.modalVisible){
      store.dispatch(
        {
          type: 'MODAL_VISIBLE',
          payload:{
            'modalVisible': false
          }
      })
    }
  }

  /**
    @param {boolean, boolean}
    updates branchOpen state
  */
  _toggleBranchesView(branchesOpen, mergeFilter){
    if(store.getState().containerStatus.status !== 'Running'){
      store.dispatch({
        type: 'MERGE_MODE',
        payload: {
          branchesOpen,
          mergeFilter
        }
      })
    } else {
      store.dispatch({
        type: 'CONTAINER_MENU_WARNING',
        payload: {
          message: 'Stop Project before switching branches. \n Be sure to save your changes.',
        }
      })
      store.dispatch({
        type: 'UPDATE_CONTAINER_MENU_VISIBILITY',
        payload: {
          containerMenuOpen: true
        }
      })
    }
  }
  /**
    @param {string}
    makes branch name pretty
    @return {string}
  */
  _sanitizeBranchName(branchName){
    const username = localStorage.getItem('username')
    const workspace = `gm.workspace-${username}`
    if(branchName){
      const prettyBranchName = (branchName === workspace) ? 'workspace' : branchName.replace(`${workspace}.`, '')

      return prettyBranchName
    }
  }
  /**
    scrolls to top of window
  */
  _scrollToTop(){
    window.scrollTo(0, 0);
  }

  render(){

    const { isAuthenticated } = this.props.auth
    const {labbookName} = this.props
    const isLockedBrowser = {locked: (this.props.isPublishing || this.props.isSyncing || this.props.isExporting), isPublishing: this.props.isPublishing, isExporting: this.props.isExporting, isSyncing: this.props.isSyncing}
    const isLockedEnvironment = this.props.isBuilding || this.props.isSyncing || this.props.isPublishing

    if(this.props.labbook){

      const {labbook} = this.props
      const name = this._sanitizeBranchName(this.props.labbook.activeBranchName)
      const {branchesOpen} = this.props
      const labbookCSS = classNames({
        'Labbook': true,
        'Labbook--detail-mode': this.props.detailMode,
        'Labbook-branch-mode': branchesOpen,
        'is-demo': window.location.hostname === Config.demoHostName,
      })

      const branchNameCSS = classNames({
        'Labbook__branch-title': true,
        'Labbook__branch-title--open': branchesOpen,
        'Labbook__branch-title--closed': !branchesOpen
      })

      const labbookHeaderCSS = classNames({
        'Labbook__header': true,
        'is-sticky': this.props.isSticky,
        'is-expanded': this.props.isExpanded
      })

      const {visibility} = this.props.labbook
      const labbookLockCSS = classNames({
        [`Labbook__${visibility}`]: true,
        [`Labbook__${visibility}--sticky`]: this.props.isSticky
      })

      return(
        <div
          className={labbookCSS}>

           <div className="Labbook__inner-container flex flex--row">
             <div className="Labbook__component-container flex flex--column">
              <div className="Labbook__header-container">
                <div className={labbookHeaderCSS}>
                  <div className="Labbook__row-container">
                   <div className="Labbook__column-container--flex-1">
                     <div className="Labbook__name-title">
                       <div>
                       {`${labbook.owner}/${labbookName}${this.props.isSticky ? '/ ': ''}`}
                       </div>
                       {
                         this.props.isSticky &&
                         <div className="Labbook__name-branch">{name}</div>
                       }

                       {  ((visibility === 'private') ||
                           (visibility === 'public')) &&

                           <div className={labbookLockCSS}></div>
                       }

                       {
                         this.props.isExpanded &&
                         <div className="Labbook__navigation-container--header flex-0-0-auto column-1-span-11">
                           <ul className="Labbook__navigation Labbook__navigation--header flex flex--row">
                            {
                              Config.navigation_items.map((item, index) => {
                                return (this._getNavItem(item, index))
                              })
                            }
                            {
                              this._changeSlider()
                            }
                          </ul>
                        </div>
                       }
                     </div>

                     <div className={branchNameCSS}>
                       <div className="Labbook__name" onClick={()=> this._toggleBranchesView(!branchesOpen, false)}>
                           {name}
                       </div>
                       <div
                         onClick={()=> this._toggleBranchesView(!branchesOpen, false)}
                        className="Labbook__branch-toggle"></div>
                        <ToolTip section="branchView"/>
                     </div>

                </div>
                <div className="Labbook__column-container">

                   <BranchMenu
                     visibility={visibility}
                     description={labbook.description}
                     history={this.props.history}
                     collaborators={labbook.collaborators}
                     defaultRemote={labbook.defaultRemote}
                     labbookId={labbook.id}
                     remoteUrl={labbook.overview.remoteUrl}
                     setSyncingState={this._setSyncingState}
                     setPublishingState={this._setPublishingState}
                     setExportingState={this._setExportingState}
                     isExporting={this.props.isExporting}
                     toggleBranchesView={this._toggleBranchesView}
                     isMainWorkspace={name === 'workspace' || name === `gm.workspace-${localStorage.getItem('username')}`}
                     auth={this.props.auth}
                    />
                    <ErrorBoundary type="containerStatusError" key="containerStatus">
                      <ContainerStatus
                        ref="ContainerStatus"
                        base={labbook.environment.base}
                        containerStatus={labbook.environment.containerStatus}
                        imageStatus={labbook.environment.imageStatus}
                        labbookId={labbook.id}
                        setBuildingState={this._setBuildingState}
                        isBuilding={this.props.isBuilding}
                        isSyncing={this.props.isSyncing}
                        isPublishing={this.props.isPublishing}
                        creationDateUtc={labbook.creationDateUtc}
                      />
                    </ErrorBoundary>
                  </div>
                </div>
                <div className={(this.props.branchesOpen) ? "Labbook__branches-container":" Labbook__branches-container Labbook__branches-container--collapsed"}>

                  <div className={(this.props.branchesOpen) ? 'Labbook__branches-shadow Labbook__branches-shadow--upper' : 'hidden'}></div>
                  <ErrorBoundary type={this.props.branchesOpen ?  'branchesError': 'hidden'} key="branches">
                    <Branches
                      defaultRemote={labbook.defaultRemote}
                      branchesOpen={this.props.branchesOpen}
                      labbook={labbook}
                      labbookId={labbook.id}
                      activeBranch={labbook.activeBranchName}
                      toggleBranchesView={this._toggleBranchesView}
                      mergeFilter={this.props.mergeFilter}
                      setBuildingState={this._setBuildingState}
                    />
                  </ErrorBoundary>

                  <div className={(this.props.branchesOpen) ? 'Labbook__branches-shadow Labbook__branches-shadow--lower' : 'hidden'}></div>
                </div>
              </div>
                <div className="Labbook__navigation-container mui-container flex-0-0-auto">
                   <ul className="Labbook__navigation flex flex--row">
                     {
                       Config.navigation_items.map((item, index) => {
                         return (this._getNavItem(item, index))
                       })
                     }
                     {
                      (this._changeSlider())
                     }
                   </ul>
                 </div>

             </div>

             <div className="Labbook__view mui-container flex flex-1-0-auto">

                  <Switch>
                    <Route
                      exact
                      path={`${this.props.match.path}`}
                      render={() => {
                        return (
                          <ErrorBoundary type="labbookSectionError">
                            <Overview
                              key={this.props.labbookName + '_overview'}
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
                        )
                      }}
                    />

                    <Route path={`${this.props.match.path}/:labbookMenu`}>
                      <Switch>
                        <Route
                          path={`${this.props.match.path}/overview`}
                          render={() => {
                            return (
                              <ErrorBoundary type="labbookSectionError" key="overview">
                                <Overview
                                  key={this.props.labbookName + '_overview'}
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
                            )
                          }}
                        />

                        <Route
                          path={`${this.props.match.path}/activity`}
                          render={() => {

                          return (
                            <ErrorBoundary type="labbookSectionError" key="activity">
                              <Activity
                                key={this.props.labbookName + '_activity'}
                                labbook={labbook}
                                activityRecords={this.props.activityRecords}
                                labbookId={labbook.id}
                                activeBranch={labbook.activeBranch}
                                isMainWorkspace={name === 'workspace'}
                                setBuildingState={this._setBuildingState}
                                {...this.props}
                              />
                            </ErrorBoundary>
                          )
                        }} />

                        <Route
                          path={`${this.props.match.url}/environment`}
                          render={() => {
                            return (
                              <ErrorBoundary type="labbookSectionError" key="environment">
                                <Environment
                                  key={this.props.labbookName + '_environment'}
                                  labbook={labbook}
                                  labbookId={labbook.id}
                                  setBuildingState={this._setBuildingState}
                                  containerStatus={this.refs.ContainerStatus}
                                  overview={labbook.overview}
                                  isLocked={isLockedEnvironment}
                                  {...this.props}
                                />
                              </ErrorBoundary>
                              )
                          }}
                        />

                        <Route path={`${this.props.match.url}/code`} render={() => {
                          return (
                            <ErrorBoundary type="labbookSectionError" key="code">
                              <Code
                                labbook={labbook}
                                labbookId={labbook.id}
                                setContainerState={this._setContainerState}
                                isLocked={isLockedBrowser}
                              />
                            </ErrorBoundary>
                            )
                        }} />

                        <Route path={`${this.props.match.url}/inputData`} render={() => {
                          return (
                            <ErrorBoundary type="labbookSectionError" key="input">
                              <InputData
                                labbook={labbook}
                                labbookId={labbook.id}
                                isLocked={isLockedBrowser}
                              />
                            </ErrorBoundary>
                              )
                        }} />

                        <Route path={`${this.props.match.url}/outputData`} render={() => {
                          return (
                            <ErrorBoundary type="labbookSectionError" key="output">
                              <OutputData
                                labbook={labbook}
                                labbookId={labbook.id}
                                isLocked={isLockedBrowser}
                              />
                            </ErrorBoundary>
                            )
                        }} />
                      </Switch>
                    </Route>
                  </Switch>

              </div>

            </div>

          </div>
          <div className="Labbook__veil"></div>
        </div>
      )

    }else{
      if(isAuthenticated()){
        return (<Loader />)
      }else{
        return (<Login auth={this.props.auth}/>)
      }
    }
  }
}

const mapStateToProps = (state, ownProps) => {
  return state.labbook
}

const mapDispatchToProps = dispatch => {
  return {
  }
}

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

      }`
  }

)

const backend = (manager: Object) => {
    const backend = HTML5Backend(manager),
        orgTopDropCapture = backend.handleTopDropCapture;

    backend.handleTopDropCapture = (e) => {

        if(backend.currentNativeSource){
          orgTopDropCapture.call(backend, e);

          backend.currentNativeSource.item.dirContent = getFilesFromDragEvent(e, {recursive: true}); //returns a promise
        }
    };

    return backend;
}

export default DragDropContext(backend)(LabbookFragmentContainer);

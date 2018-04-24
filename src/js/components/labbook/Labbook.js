//vendor
import React, { Component } from 'react'
import { Route , Switch, Link} from 'react-router-dom';
import {
  createFragmentContainer,
  graphql
} from 'react-relay'

import StickyHeader from 'react-sticky-header';
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import classNames from 'classnames'
//store
import store from "JS/redux/store"
//components
import Login from 'Components/login/Login';
import Activity from './activity/Activity'
import Code from './code/Code'
import InputData from './inputData/InputData'
import OutputData from './outputData/OutputData'
import Overview from './overview/Overview'
import Environment from './environment/Environment'
import ContainerStatus from './containerStatus/ContainerStatus'
import Loader from 'Components/shared/Loader'
import Branches from './branches/Branches'
import BranchMenu from './branchMenu/BranchMenu'
//utils
import {getFilesFromDragEvent, getFiles} from "JS/utils/html-dir-content";

import Config from 'JS/config'

let unsubscribe;

class Labbook extends Component {
  constructor(props){
  	super(props);

    localStorage.setItem('owner', store.getState().routes.owner)
    this.state = store.getState().labbook
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

  componentWillMount() {
    const {labbookName, owner} = store.getState().routes
    document.title =  `${owner}/${labbookName}`
  }

  componentWillReceiveProps(nextProps) {

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
    unsubscribe = store.subscribe(() =>{
        this.storeDidUpdate(store.getState().labbook)
    })

    window.addEventListener('scroll', this._setStickHeader)
    window.addEventListener('click', this._branchViewClickedOff )
  }
  /**
    @param {}
    unsubscribe from redux store
  */
  componentWillUnmount() {
    unsubscribe()


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
      let sticky = 50;

      store.dispatch({
        type: 'UPDATE_STICKY_STATE',
        payload: {
          'isSticky': window.pageYOffset >= sticky
        }
      })
    }
  /**
    @param {object} labbook
    updates state of labbook when prompted ot by the store
    updates history prop
  */
  storeDidUpdate = (labbook) => {
    let stateString = JSON.stringify(this.state).replace(/\s/g, '')
    let labbookString = JSON.stringify(labbook).replace(/\s/g, '')

    if(stateString !== labbookString){

      this.setState(labbook);//triggers re-render when store updates
    }
  }
  /**
    @param {string} componentName - input string componenetName
    updates state of selectedComponent
    updates history prop
  */
  _setSelectedComponent = (componentName) =>{
    if(componentName !== this.state.selectedComponent){
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

    this.refs['ContainerStatus'].setState({'isBuilding': isBuilding})

    if(this.state.isBuilding !== isBuilding){
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
    this.refs['ContainerStatus'].setState({ 'isSyncing': isSyncing })

    if (this.state.isSyncing !== isSyncing) {
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

    this.refs['ContainerStatus'].setState({ 'isPublishing': isPublishing })

    if (this.state.isPublishing !== isPublishing) {
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

    this.refs['ContainerStatus'].setState({ 'isExporting': isExporting })

    if (this.state.isExporting !== isExporting) {
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
          to={`../../../labbooks/${this.state.owner}/${this.props.match.params.labbookName}/${item.id}`}
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

    if(document.getElementById('labbookModal')){
      document.getElementById('labbookModal').classList.remove('hidden')
    }

    if(document.getElementById('modal__cover')){
      document.getElementById('modal__cover').classList.remove('hidden')
    }

    if(!this.state.modalVisible){
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

    if(this.state.modalVisible){
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
    @param {}
    updates branchOpen state
  */
  _toggleBranchesView(branchesOpen, mergeFilter){

    store.dispatch({
      type: 'MERGE_MODE',
      payload: {
        branchesOpen,
        mergeFilter
      }
    })

  }
  /**
    @param {branchName}
    makes branch name pretty
    @return {prettyBranchName}
  */
  _sanitizeBranchName(branchName){
    const username = localStorage.getItem('username')
    const workspace = `gm.workspace-${username}`
    const prettyBranchName = (branchName === workspace) ? 'workspace' : branchName.replace(`${workspace}.`, '')

    return prettyBranchName
  }

  render(){

    const { isAuthenticated } = this.props.auth
    const {labbookName} = this.props
    const isLockedBrowser = {locked: (this.state.isPublishing || this.state.isSyncing || this.state.isExporting), isPublishing: this.state.isPublishing, isExporting: this.state.isExporting, isSyncing: this.state.isSyncing}
    const isLockedEnvironment = this.state.isBuilding || this.state.isSyncing || this.state.isPublishing

    if(this.props.labbook){
      const {labbook} = this.props
      const name = this._sanitizeBranchName(this.props.labbook.activeBranchName)
      const {branchesOpen} = this.state
      const labbookCSS = classNames({
        'Labbook': true,
        'Labbook--detail-mode': this.state.detailMode,
        'Labbook-branch-mode': branchesOpen
      })

      const branchNameCSS = classNames({
        'Labbook__branch-title': true,
        'Labbook__branch-title--open': branchesOpen,
        'Labbook__branch-title--closed': !branchesOpen
      })

      const labbookHeaderCSS = classNames({
        'Labbook__header': true,
        'is-sticky': this.state.isSticky
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
                       {labbook.owner + '/' + labbookName}
                     </div>

                     <div className={branchNameCSS}>
                       <div className="Labbook__name" onClick={()=> this._toggleBranchesView(!branchesOpen, false)}>
                           {name}
                       </div>
                       <div
                         onClick={()=> this._toggleBranchesView(!branchesOpen, false)}
                        className="Labbook__branch-toggle"></div>
                     </div>

                </div>
                <div className="Labbook__column-container">
                   <BranchMenu
                     history={this.props.history}
                     collaborators={labbook.collaborators}
                     canManageCollaborators={labbook.canManageCollaborators}
                     defaultRemote={labbook.defaultRemote}
                     labbookId={labbook.id}
                     remoteUrl={labbook.overview.remoteUrl}
                     setSyncingState={this._setSyncingState}
                     setPublishingState={this._setPublishingState}
                     setExportingState={this._setExportingState}
                     toggleBranchesView={this._toggleBranchesView}
                     isMainWorkspace={name === 'workspace' || name === `gm.workspace-${localStorage.getItem('username')}`}
                    />

                     <ContainerStatus
                       ref="ContainerStatus"
                       base={labbook.environment.base}
                       containerStatus={labbook.environment.containerStatus}
                       imageStatus={labbook.environment.imageStatus}
                       labbookId={labbook.id}
                       setBuildingState={this._setBuildingState}
                       isBuilding={this.state.isBuilding}
                       isSyncing={this.state.isSyncing}
                       isPublishing={this.state.isPublishing}
                       creationDateUtc={labbook.creationDateUtc}
                     />
                  </div>
                </div>
                <div className={(this.state.branchesOpen) ? "Labbook__branches-container":" Labbook__branches-container Labbook__branches-container--collapsed"}>

                  <div className={(this.state.branchesOpen) ? 'Labbook__branches-shadow Labbook__branches-shadow--upper' : 'hidden'}></div>

                <Branches
                  defaultRemote={labbook.defaultRemote}
                  branchesOpen={this.state.branchesOpen}
                  labbook={labbook}
                  labbookId={labbook.id}
                  activeBranch={labbook.activeBranchName}
                  toggleBranchesView={this._toggleBranchesView}
                  mergeFilter={this.state.mergeFilter}
                  setBuildingState={this._setBuildingState}
                />

                  <div className={(this.state.branchesOpen) ? 'Labbook__branches-shadow Labbook__branches-shadow--lower' : 'hidden'}></div>
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

                        return (<Overview
                          key={this.state.labbookName + '_overview'}
                          labbook={labbook}
                          description={labbook.description}
                          labbookId={labbook.id}
                          setBuildingState={this._setBuildingState}
                          readme={labbook.readme}
                        />)
                      }}
                    />

                    <Route path={`${this.props.match.path}/:labbookMenu`}>
                      <Switch>
                        <Route
                          path={`${this.props.match.path}/overview`}
                          render={() => {
                            return (<Overview
                              key={this.state.labbookName + '_overview'}
                              labbook={labbook}
                              description={labbook.description}
                              readme={labbook.readme}
                            />)
                          }}
                        />

                        <Route
                          path={`${this.props.match.path}/activity`}
                          render={() => {
                          return (
                            <Activity
                              key={this.state.labbookName + '_activity'}
                              labbook={labbook}
                              activityRecords={this.props.activityRecords}
                              labbookId={labbook.id}
                              activeBranch={labbook.activeBranch}
                              isMainWorkspace={name === 'workspace'}
                              {...this.props}
                            />)
                        }} />

                        <Route
                          path={`${this.props.match.url}/environment`}
                          render={() => {
                            return (
                              <Environment
                                key={this.state.labbookName + '_environment'}
                                labbook={labbook}
                                labbookId={labbook.id}
                                setBuildingState={this._setBuildingState}
                                containerStatus={this.refs.ContainerStatus}
                                overview={labbook.overview}
                                isLocked={isLockedEnvironment}
                                {...this.props}
                              />)
                          }}
                        />

                        <Route path={`${this.props.match.url}/code`} render={() => {
                          return (
                            <Code
                              labbook={labbook}
                              labbookId={labbook.id}
                              setContainerState={this._setContainerState}
                              isLocked={isLockedBrowser}
                            />)
                        }} />

                        <Route path={`${this.props.match.url}/inputData`} render={() => {
                          return (
                            <InputData
                              labbook={labbook}
                              labbookId={labbook.id}
                              isLocked={isLockedBrowser}
                            />)
                        }} />

                        <Route path={`${this.props.match.url}/outputData`} render={() => {
                          return (
                            <OutputData
                              labbook={labbook}
                              labbookId={labbook.id}
                              isLocked={isLockedBrowser}
                            />)
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


const LabbookFragmentContainer = createFragmentContainer(
  Labbook,
  {
    labbook: graphql`
      fragment Labbook_labbook on Labbook{
          id
          description
          readme
          defaultRemote
          owner
          creationDateUtc

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
            numCustomDependencies
          }

          collaborators
          canManageCollaborators

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

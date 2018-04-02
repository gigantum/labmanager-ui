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
  }
  /**
    @param {}
    unsubscribe from redux store
  */
  componentWillUnmount() {
    unsubscribe()
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
    @param {object} item
    returns nav jsx
  */

  _changeSlider() {
    let pathArray = this.props.location.pathname.split('/')
    let selectedPath = (pathArray.length > 4 ) ? pathArray[pathArray.length - 1] : 'overview'
    let defaultOrder = ['overview', 'activity', 'environment', 'code', 'inputData', 'outputData'];
    let selectedIndex = defaultOrder.indexOf(selectedPath);
    return (
      <hr className={'Labbook__navigation-slider--' + selectedIndex}/>
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
  _toggleBranchesView(){
    if(!this.state.isSticky){
    store.dispatch({
      type: 'UPDATE_BRANCHES_VIEW',
      payload: {
        branchesOpen: !this.state.branchesOpen
      }
    })
    }
  }

  render(){

    const { isAuthenticated } = this.props.auth
    const {labbookName} = this.props

    if(this.props.labbook){
      const {labbook} = this.props
      const name = this.props.labbook.activeBranch ? this.props.labbook.activeBranch.name.replace(/-/g, ' ') : 'temp'
      const labbookCSS = classNames({
        'Labbook': true,
        'Labbook--detail-mode': this.state.detailMode,
        'Labbook-branch-mode': this.state.branchesOpen
      })
      return(
        <div
          className={labbookCSS}>

           <div className="Labbook__inner-container flex flex--row">
             <div className="Labbook__component-container flex flex--column">
              <StickyHeader
                header ={
              <div className="Labbook__header">
                <div className="Labbook__row-container">
                 <div className="Labbook__column-container--flex-1">
                   <div className="Labbook__name-title">
                     {labbook.owner + '/' + labbookName}
                   </div>

                   <div className={(this.state.branchesOpen) ? 'Labbook__branch-title Labbook__branch-title--open' : 'Labbook__branch-title Labbook__branch-title--closed'}>
                     <div className="Labbook__name" onClick={()=> this._toggleBranchesView()}>
                         {name}
                     </div>
                     <div
                       onClick={()=> this._toggleBranchesView()}
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
                    />

                   <ContainerStatus
                     ref="ContainerStatus"
                     base={labbook.environment.base}
                     containerStatus={labbook.environment.containerStatus}
                     imageStatus={labbook.environment.imageStatus}
                     labbookId={labbook.id}
                     setBuildingState={this._setBuildingState}
                     isBuilding={this.state.isBuilding}
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
                  activeBranch={labbook.activeBranch}
                />

                <div className={(this.state.branchesOpen) ? 'Labbook__branches-shadow Labbook__branches-shadow--lower' : 'hidden'}></div>
              </div>
              </div>}>
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


              </StickyHeader>

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
                            />)
                        }} />

                        <Route path={`${this.props.match.url}/inputData`} render={() => {
                          return (
                            <InputData
                              labbook={labbook}
                              labbookId={labbook.id}
                            />)
                        }} />

                        <Route path={`${this.props.match.url}/outputData`} render={() => {
                          return (
                            <OutputData
                              labbook={labbook}
                              labbookId={labbook.id}
                            />)
                        }} />
                      </Switch>
                    </Route>
                  </Switch>

              </div>

            </div>

          </div>
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
          updatesAvailableCount
          isRepoClean
          defaultRemote
          owner
          creationDateUtc
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

          ...Environment_labbook
          ...Overview_labbook
          ...Activity_labbook
          ...Code_labbook
          ...InputData_labbook
          ...OutputData_labbook
          ...Branches_labbook

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

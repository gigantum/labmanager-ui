//vendor
import React, { Component } from 'react'
import { Route , Switch, Link} from 'react-router-dom';
import {
  createFragmentContainer,
  graphql
} from 'react-relay'
//store
import store from "JS/redux/store"
//components
import Activity from './activity/Activity'
import Code from './code/Code'
import InputData from './inputData/InputData'
import OutputData from './outputData/OutputData'
import Overview from './overview/Overview'
import Environment from './environment/Environment'
import ContainerStatus from './ContainerStatus'
import Loader from 'Components/shared/Loader'
import Branches from './branches/Branches'
import BranchMenu from './BranchMenu'

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

}

componentWillMount() {
  const {labbookName, owner} = store.getState().routes
  document.title =  `${owner}/${labbookName}`
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
  let stateString = JSON.stringify(this.state)
  let labbookString = JSON.stringify(labbook)
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
    const {owner} = store.getState().routes
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
  _getNavItem(item){
    let pathArray = this.props.location.pathname.split('/')
    let selectedPath = (pathArray.length > 4 ) ? pathArray[pathArray.length - 1] : 'overview' // sets avtive nav item to overview if there is no menu item in the url
    return (
      <div
        id={item.id}
        key={item.id}
        className={(selectedPath === item.id) ? 'selected' : 'Labbook__navigation-item--' + item.id}
        onClick={()=> this._setSelectedComponent(item.id)}
        >
        <Link
          to={`../../../labbooks/${this.state.owner}/${this.props.match.params.labbookName}/${item.id}`} replace={true}>
          {item.name}
        </Link>
      </div>
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

    store.dispatch({
      type: 'UPDATE_BRANCHES_VIEW',
      payload: {
        branchesOpen: !this.state.branchesOpen
      }
    })
  }


  render(){

    const {labbookName} = this.props;

    if(this.props.labbook){
      return(
        <div
          className={this.state.detailMode ? "Labbook Labbook--detail-mode" : "Labbook"}>

           <div className="Labbook__inner-container flex flex--row">
             <div className="Labbook__component-container flex flex--column">
               <div className="Labbook__header-conatiner">
                 <div className="Labbook__name-title">
                   {this.props.labbook.owner.username + '/' + labbookName}
                 </div>
                 <BranchMenu
                    collaborators={this.props.labbook.collaborators}
                    canManageCollaborators={this.props.labbook.canManageCollaborators}
                    defaultRemote={this.props.labbook.defaultRemote}
                    labbookId={this.props.labbook.id}
                  />
              </div>
               <div className="Labbook__header flex flex--row justify--space-between">

                 <div className={(this.state.branchesOpen) ? 'Labbook__branch-title Labbook__branch-title--open' : 'Labbook__branch-title Labbook__branch-title--closed'}>
                   <h2 onClick={()=> this._toggleBranchesView()}>{this.props.labbook.activeBranch.name}</h2>
                   <div
                     onClick={()=> this._toggleBranchesView()}
                    className="Labbook__branch-toggle"></div>
                 </div>

                 <ContainerStatus
                   ref="ContainerStatus"
                   containerStatus={this.props.labbook.environment.containerStatus}
                   imageStatus={this.props.labbook.environment.imageStatus}
                   labbookId={this.props.labbook.id}
                   setBuildingState={this._setBuildingState}
                   isBuilding={this.state.isBuilding}
                 />
              </div>
              <div className={(this.state.branchesOpen) ? "Labbook__branches-container":" Labbook__branches-container Labbook__branches-container--collapsed"}>
                <div className={(this.state.branchesOpen) ? 'Labbook__branches-shadow Labbook__branches-shadow--upper' : 'hidden'}></div>

                <Branches
                  defaultRemote={this.props.labbook.defaultRemote}
                  branchesOpen={this.state.branchesOpen}
                  labbook={this.props.labbook}
                  labbookId={this.props.labbook.id}
                  activeBranch={this.props.labbook.activeBranch}
                />
                  <div className={(this.state.branchesOpen) ? 'Labbook__branches-shadow Labbook__branches-shadow--lower' : 'hidden'}></div>
              </div>

              <div className="Labbook__navigation-container mui-container flex-0-0-auto">
                 <nav className="Labbook__navigation flex flex--row">
                   {
                     Config.navigation_items.map((item) => {
                       return (this._getNavItem(item))
                     })
                   }
                 </nav>
               </div>

               <div className="Labbook__view mui-container flex flex-1-0-auto">

                  <Switch>
                    <Route
                      exact
                      path={`${this.props.match.path}`}
                      render={() => {

                        return (<Overview
                          key={this.state.labbookName + '_overview'}
                          labbook={this.props.labbook}
                          description={this.props.labbook.description}
                          labbookId={this.props.labbook.id}
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
                              labbook={this.props.labbook}
                              description={this.props.labbook.description}
                            />)
                          }}
                        />

                        <Route
                          path={`${this.props.match.path}/activity`}
                          render={() => {
                          return (
                            <Activity
                              key={this.state.labbookName + '_activity'}
                              labbook={this.props.labbook}
                              activityRecords={this.props.activityRecords}
                              labbookId={this.props.labbook.id}
                              {...this.props}

                            />)
                        }} />

                        <Route
                          path={`${this.props.match.url}/environment`}
                          render={() => {
                            return (
                              <Environment
                                key={this.state.labbookName + '_environment'}
                                labbook={this.props.labbook}
                                labbookId={this.props.labbook.id}
                                setBuildingState={this._setBuildingState}
                                containerStatus={this.refs.ContainerStatus}
                                {...this.props}
                              />)
                          }}
                        />

                        <Route path={`${this.props.match.url}/code`} render={() => {
                          return (
                            <Code
                              labbook={this.props.labbook}
                              labbookId={this.props.labbook.id}
                              setContainerState={this._setContainerState}
                            />)
                        }} />

                        <Route path={`${this.props.match.url}/inputData`} render={() => {
                          return (
                            <InputData
                              labbook={this.props.labbook}
                              labbookId={this.props.labbook.id}
                            />)
                        }} />

                        <Route path={`${this.props.match.url}/outputData`} render={() => {
                          return (
                            <OutputData
                              labbook={this.props.labbook}
                              labbookId={this.props.labbook.id}
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
    return (<Loader />)
  }
  }
}


export default createFragmentContainer(
  Labbook,
  {
    labbook: graphql`
      fragment Labbook_labbook on Labbook{
          id
          description
          updatesAvailableCount
          isRepoClean
          defaultRemote
          owner{
            username
          }
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

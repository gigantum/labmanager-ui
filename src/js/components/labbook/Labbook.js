//vendor
import React, { Component } from 'react'
import { Route , Switch, Link} from 'react-router-dom';
import {
  createFragmentContainer,
  graphql
} from 'react-relay'

import store from "JS/redux/store"

//components
import Notes from './notes/Notes'
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

    store.dispatch({
      type: 'INITIALIZE',
      payload:{
        'selectedComponent': (props.location.pathname.split('/').length > 3) ? props.location.pathname.split('/')[3] : 'overview' ,
        'containerState': props.labbook.environment.containerStatus,
        'imageStatus': props.labbook.environment.imageStatus
      }
    })
    this.state = store.getState()

    this._setSelectedComponent = this._setSelectedComponent.bind(this)
    this._setBuildingState = this._setBuildingState.bind(this)
    this._showLabbookModal = this._showLabbookModal.bind(this)
    this._hideLabbookModal = this._hideLabbookModal.bind(this)


}
/*
  subscribe to store to update state
  set unsubcribe for store
*/
componentDidMount() {
  unsubscribe = store.subscribe(() =>{

    this.storeDidUpdate(store.getState().labbook)
  })
}
/*
  unsubscribe from redux store
*/
componentWillUnmount() {
  //unsubscribe()
}
/**
  @param {object} labbook
  updates state of labbook when prompted ot by the store
  updates history prop
*/
storeDidUpdate = (labbook) => {
  //for(this.state)
  if(this.state !== labbook){
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

      store.dispatch(
        {type: 'SELECTED_COMPONENT',
        payload:{
          'selectedComponent': componentName
        }
      })

      this.props.history.replace(`../../labbooks/${this.props.match.params.labbookName}/${componentName}`)
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
    return (
      <div
        id={item.id}
        key={item.id}
        className={(this.state.selectedComponent === item.id) ? 'selected' : 'Labbook__navigation-item--' + item.id}
        onClick={()=> this._setSelectedComponent(item.id)}
        >
        <Link
          to={`../../labbooks/${this.props.match.params.labbookName}/${item.id}`} replace={true}>
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

  render(){

    const {labbookName} = this.props;

    if(this.props.labbook){
      return(
        <div
          className={this.state.detailMode ? "Labbook Labbook--detail-mode" : "Labbook"}>

           <div className="Labbook__inner-container flex flex--row">
             <div className="Labbook__component-container flex flex--column">
               <BranchMenu
                defaultRemote={this.props.labbook.defaultRemote}
                labbookName={labbookName}
                labbookId={this.props.labbook.id}
              />
               <div className="Labbook__header flex flex--row justify--space-between">

                 <h4 className="Labbook__name-title">
                   {labbookName}
                 </h4>

                 <ContainerStatus
                   ref="ContainerStatus"
                   containerStatus={this.props.labbook.environment.containerStatus}
                   imageStatus={this.props.labbook.environment.imageStatus}
                   labbookName={labbookName}
                   labbookId={this.props.labbook.id}
                   setBuildingState={this._setBuildingState}
                   isBuilding={this.state.isBuilding}
                 />
              </div>
              <Branches
                defaultRemote={this.props.labbook.defaultRemote}
                labbookName={labbookName}
                labbook={this.props.labbook}
                labbookId={this.props.labbook.id}
              />
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
                          key={this.props.labbookName + '_overview'}
                          labbook={this.props.labbook}
                          description={this.props.labbook.description}
                          labbookName={labbookName}
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
                              key={this.props.labbookName + '_overview'}
                              labbook={this.props.labbook}
                              description={this.props.labbook.description}
                              labbookName={labbookName}

                            />)
                          }}
                        />

                        <Route
                          path={`${this.props.match.path}/notes`}
                          render={() => {
                          return (<Notes
                              key={this.props.labbookName + '_notes'}
                              labbook={this.props.labbook}
                              notes={this.props.notes}
                              labbookName={labbookName}
                              labbookId={this.props.labbook.id}

                              {...this.props}
                            />)
                        }} />

                        <Route
                          path={`${this.props.match.url}/environment`}
                          render={() => {
                            return (<Environment
                              key={labbookName + '_environment'}
                              labbook={this.props.labbook}
                              labbookId={this.props.labbook.id}
                              setBuildingState={this._setBuildingState}
                              labbookName={labbookName}
                              containerStatus={this.refs.ContainerStatus}
                              {...this.props}
                            />)
                          }}
                        />

                        <Route path={`${this.props.match.url}/code`} render={() => {
                          return (
                            <Code
                              labbook={this.props.labbook}
                              labbookName={labbookName}
                              labbookId={this.props.labbook.id}
                              setContainerState={this._setContainerState}
                            />)
                        }} />

                        <Route path={`${this.props.match.url}/inputData`} render={() => {
                          return (
                            <InputData
                              labbook={this.props.labbook}
                              labbookName={labbookName}
                              labbookId={this.props.labbook.id}
                            />)
                        }} />

                        <Route path={`${this.props.match.url}/outputData`} render={() => {
                          return (
                            <OutputData
                              labbook={this.props.labbook}
                              labbookId={this.props.labbook.id}
                              labbookName={labbookName}
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

          ...Environment_labbook
          ...Overview_labbook
          ...Notes_labbook
          ...Code_labbook
          ...InputData_labbook
          ...OutputData_labbook
          ...Branches_labbook

      }`
  }

)

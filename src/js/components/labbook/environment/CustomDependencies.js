//vendor
import React, { Component } from 'react'
import {createPaginationContainer, graphql} from 'react-relay'
import classNames from 'classnames'
import uuidv4 from 'uuid/v4'
//components
import CustomDependenciesDropdown from './CustomDependenciesDropdown'
//Mutations
import AddCustomComponentMutation from 'Mutations/environment/AddCustomComponentMutation'
import RemoveCustomComponentMutation from 'Mutations/environment/RemoveCustomComponentMutation'
//store
import store from 'JS/redux/store'


let owner
let totalCount = 2;
let unsubscribe;

class CustomDependencies extends Component {
  constructor(props){
    super(props);

    const {labbookName} = store.getState().routes
    owner = store.getState().routes.owner //TODO clean this up when fixing custom dependencies

    this.state = {
      owner,
      labbookName,
      'customDependencies': [],
      'viewContainerVisible': false,
      'searchValue': ''
    };

    this._addDependency = this._addDependency.bind(this)
    this._addCustomDepenedenciesMutation = this._addCustomDepenedenciesMutation.bind(this)
    this._removeDependencyMuation = this._removeDependencyMuation.bind(this)
  }

  /*
    handle state and addd listeners when component mounts
  */
  componentDidMount() {

    if(this.props.environment.customDependencies.pageInfo.hasNextPage){
      this._loadMore() //routes query only loads 2, call loadMore
    }

    unsubscribe = store.subscribe(() =>{

      this.storeDidUpdate(store.getState().environment)
    })
  }

  /**
    unsubscribe from redux store
  */
  componentWillUnmount() {
    unsubscribe()
  }

  /**
    @param {object} footer
    unsubscribe from redux store
  */
  storeDidUpdate = (environmentStore) => {

    if(this.state.viewContainerVisible !== environmentStore.viewContainerVisible){

      this.setState({viewContainerVisible: environmentStore.viewContainerVisible});//triggers re-render when store updates
    }
  }
  /*
    @param
    triggers relay pagination function loadMore
    increments by 10
    logs callback
  */
  _loadMore() {

    let self = this;
    this.props.relay.loadMore(
     5, // Fetch the next 5 feed items
     (response, error) => {
       if(error){
         console.error(error)
       }

       if(self.props.environment.customDependencies &&
         self.props.environment.customDependencies.pageInfo.hasNextPage) {

         self._loadMore()
       }
     }
   );
  }
  /**
  *  @param {object} customDependencyEdge
  *  pushes custom dependency to list
  */
  _addDependency(customDependencyEdge){
    let customDependencies = this.state.customDependencies
    let dependencyExists = customDependencies.filter((edge)=>{
      return edge.node.id === customDependencyEdge.node.id
    })[0]

    if(dependencyExists === undefined){
      customDependencies.push(customDependencyEdge)
      this.setState({'customDependencies': customDependencies})
    }
  }
  /**
  *  @param {object} customDependencyEdge
  *  remove dependency from list
  */
  _removeDependency(customDependencyEdge, index){
    let customDependencies = this.state.customDependencies

    customDependencies.splice(index, 1)

    this.setState({'customDependencies': customDependencies})
  }
  /**
  *  @param {}
  *  toggle state and view of container
  */
  _toggleViewContainer(){
    if((store.getState().containerStatus.status === 'Closed') || (store.getState().containerStatus.status === 'Failed')){
      store.dispatch({
        type: 'TOGGLE_CUSTOM_MENU',
        payload: {
          viewContainerVisible: !this.state.viewContainerVisible
        }
      })

    }else{
      this._promptUserToCloseContainer()
    }
  }

  /**
  *  @param {}
  *  remove dependency from list
  */
  _addCustomDepenedenciesMutation(){
    const {labbookName, owner} = store.getState().routes
    const {customDependencies} = this.state
    const {environmentId} = this.props
    let self = this

    let index = 0

    function addDependency(customDependency){

      const {repository, componentId, revision} = customDependency.node
      AddCustomComponentMutation(
        owner,
        labbookName,
        repository,
        componentId,
        revision,
        environmentId,
        index,
        (response, error) => {

          if(error){

          }else{

            index++

            if(customDependencies[index]){
              addDependency(customDependencies[index])
            }else{
              self.setState({'customDependencies':[]})
              self.props.buildCallback()
            }

          }
        }
      )
    }

    addDependency(customDependencies[index])
  }
  /**
  *  @param {}
  *  remove dependency from list
  */
  _removeDependencyMuation(customDependency){
    const {labbookName, owner} = store.getState().routes
    const {repository, componentId} = customDependency.node
    const nodeID = customDependency.node.id
    const {environmentId} = this.props
    const uid = uuidv4()
    let self = this

    RemoveCustomComponentMutation(
      labbookName,
      owner,
      repository,
      componentId,
      nodeID,
      uid,
      environmentId,
      "CustomDependencies_customDependencies",
      (response, error)=>{
        self.props.buildCallback()
        if(error){

        }
      }
    )
  }
  /**
  *  @param {evt}
  *  remove dependency from list
  */
  _setSearchValue(evt){
    this.setState({'searchValue': evt.target.value})
  }

  /**
  *  @param {object}
  *  filters custom dependencies in table view
  */
  _filterCustomDependencies(customDependencies){

    let searchValue = this.state.searchValue.toLowerCase()
    let dependencies = customDependencies.edges.filter((edge)=>{

      let name = edge.node.name.toLowerCase()
      let searchMatch = ((searchValue === '') || (name.indexOf(searchValue) > -1))
      return searchMatch
    })

    return dependencies
  }


  /**
  *  @param {}
  *  user redux to open stop container button
  *  sends message to footer
  */
  _promptUserToCloseContainer(){
    store.dispatch({
      type: 'UPDATE_CONTAINER_MENU_VISIBILITY',
      payload: {
        containerMenuOpen: true
      }
    })

    store.dispatch({
      type: 'WARNING_MESSAGE',
      payload: {
        message: 'Stop container to edit environment, and save any unsaved changes.'
      }
    })
  }


  render(){

    const {customDependencies} = this.props.environment;

  
    if (customDependencies) {
      const viewContainerCss = classNames({
        'CustomDependencies__view-container': true,
        'CustomDependencies__view-container--no-height': !this.state.viewContainerVisible
      })

      const customDependenciesEdges = this._filterCustomDependencies(customDependencies)
      return(
        <div className="CustomDependencies">

            <div className="CustomDependencies__header-container">
              <h4 className="CustomDependencies__header">
                Custom Dependencies
              </h4>
            </div>
            <div className="CustomDependencies__card">
            <div className="CustomDependencies__add-dependencies">
              <button
                onClick={()=>{this._toggleViewContainer()}}
                className="CustomDependencies__button--flat">
                Add Dependencies</button>
              <div className={viewContainerCss}>
                <CustomDependenciesDropdown
                  addDependency={this._addDependency}
                  removeDependency={this._removeDependency}
                />

                <div className="CustomDependencies__table-container">
                  {
                    this.state.customDependencies.map((edge, index)=>{
                      return(
                        <div className="CustomDependencies__item">
                          <div>{edge.node.name}</div>
                          <div>
                            <button
                              className="CustomDependencies__button--round CustomDependencies__button--remove"
                              onClick={()=> this._removeDependency(edge, index)}></button>
                          </div>
                        </div>)
                    })
                  }
                  <button
                    className="CustomDependencies__button"
                    disabled={this.state.customDependencies.length === 0}
                    onClick={() => this._addCustomDepenedenciesMutation()}>
                    Install Selected Dependencies
                  </button>
                </div>
              </div>
            </div>

            <div className="CustomDependencies__table--container">
              <input
                type="text"
                className="full--border"
                placeholder="Filter dependencies by keyword"
                onKeyUp={(evt)=> this._setSearchValue(evt)}
              />

              <table className="CustomDependencies__table">
                <thead>
                  <tr>
                    <th>Dependency Name</th>
                    <th>Current</th>
                    <th>Latest</th>
                    <th>Installed By</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {
                    customDependenciesEdges.map((edge, index) => {
                      if(edge){
                        return (<CustomDependencyItem
                          key={edge.node.id}
                          edge={edge}
                          index={index}
                          self={this} />)
                      }
                    })
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

      )
    }
  }


}

const CustomDependencyItem = ({edge, index, self}) =>{

  return(
    <tr
      key={self.props.labbookName + edge.node.id + index}
      className="CustomDependencies__table-row">
      <td>{edge.node.name}</td>
      <td></td>
      <td></td>
      <td></td>
      <td width="60">
        <button
          className="CustomDependencies__button--round CustomDependencies__button--remove"
          onClick={()=> self._removeDependencyMuation(edge) }></button>
      </td>
  </tr>)
}

export default createPaginationContainer(
  CustomDependencies,
  {
    environment: graphql`fragment CustomDependencies_environment on Environment {
      customDependencies(first: $first, after: $cursor) @connection(key:"CustomDependencies_customDependencies"){
        edges{
          node{
            id
            schema
            repository
            componentId
            revision
            name
            description
            tags
            license
            osBaseClass
            url
            requiredPackageManagers
            dockerSnippet
          }
          cursor
        }
        pageInfo{
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
  }`

},
{
    direction: 'forward',
    metadata: {field: 'customDependencies'},
    getConnectionFromProps(props) {
        return props.environment && props.environment.customDependencies;
    },
    getFragmentVariables(prevVars, first) {
      return {
       ...prevVars,
       first: first,
     };
   },
   getVariables(props, {count}, fragmentVariables) {
     totalCount += count
     let first = totalCount;
     let length = props.environment.customDependencies.edges.length
     const {labbookName, owner} = store.getState().routes

     let cursor = props.environment.customDependencies.edges[length-1].cursor

     return {
       first,
       cursor,
       name: labbookName,
       owner
       // in most cases, for variables other than connection filters like
       // `first`, `after`, etc. you may want to use the previous values.
       //orderBy: fragmentVariables.orderBy,
     };
   },
   query: graphql`
    query CustomDependenciesPaginationQuery($name: String!, $owner: String!, $first: Int!, $cursor: String){
     labbook(name: $name, owner: $owner){
       environment{
         ...CustomDependencies_environment
       }
     }
   }`
}
)

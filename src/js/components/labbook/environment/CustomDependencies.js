//vendor
import React, { Component } from 'react'
import {createPaginationContainer, graphql} from 'react-relay'
import classNames from 'classnames'
//components
import CustomDependenciesDropdown from './CustomDependenciesDropdown'
import Loader from 'Components/shared/Loader'
//Mutations
import AddCustomComponentMutation from 'Mutations/environment/AddCustomComponentMutation'
import RemoveCustomComponentMutation from 'Mutations/environment/RemoveCustomComponentMutation'

//store
import store from 'JS/redux/store'
let owner
class CustomDependencies extends Component {
  constructor(props){
    super(props);

    const {labbookName} = store.getState().routes
    owner = store.getState().routes.owner //TODO clean this up when fixing custom dependencies

    this.state = {
      'modal_visible': false,
      owner,
      labbookName,
      customDependencies: [],
      viewContainerVisible: false
    };

    this._openModal = this._openModal.bind(this)
    this._hideModal = this._hideModal.bind(this)
    this._setComponent = this._setComponent.bind(this)
    this._addDependency = this._addDependency.bind(this)
    this._addCustomDepenedenciesMutation = this._addCustomDepenedenciesMutation.bind(this)
    this._removeDependencyMuation = this._removeDependencyMuation.bind(this)
  }

  /**
  *  @param {none}
  *  open modal window
  */
  _openModal = () => {
      this.setState({'modal_visible': true})
      if(document.getElementById('modal__cover')){
        document.getElementById('modal__cover').classList.remove('hidden')
      }
  }
  /**
  *  @param {none}
  *   hide modal window
  */
  _hideModal = () => {
      this.setState({'modal_visible': false})
      if(document.getElementById('modal__cover')){
        document.getElementById('modal__cover').classList.add('hidden')
      }
  }
  /**
  *  @param {comp}
  *   hide modal window
  */
  _setComponent = (comp) => {

    this._hideModal();
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
    this.setState({'viewContainerVisible': !this.state.viewContainerVisible})
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
            self._removeDependency(customDependencies[index], index)
            index++
            if(customDependencies[index]){
              addDependency(customDependencies[index])
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

    RemoveCustomComponentMutation(
      labbookName,
      owner,
      repository,
      componentId,
      nodeID,
      "tempID",
      environmentId,
      "CustomDependencies_customDependencies",
      (response, error)=>{
        if(error){

        }
      }
    )
  }


  render(){

    const {customDependencies} = this.props.environment;


    if (customDependencies) {
      const viewContainerCss = classNames({
        'CustomDependencies__view-container': true,
        'CustomDependencies__view-container--no-height': !this.state.viewContainerVisible
      })
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
                              className="CustomDependenciesDropdown__button--round"
                              onClick={()=> this._removeDependency(edge, index)}></button>
                          </div>
                        </div>)
                    })
                  }
                  <button
                    className="CustomDependencies__button"
                    onClick={() => this._addCustomDepenedenciesMutation()}>
                    Install Selected Dependencies
                  </button>
                </div>
              </div>
            </div>

            <div className="CustomDependencies__table--container">
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
                    customDependencies.edges.map((edge, index) => {
                      if(edge){
                        return (<CustomDependencyItem
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
          className="CustomDependencies__button--round"
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
        return props.labbook && props.labbook.environment;
    },
    getFragmentVariables(prevVars, first) {
      return {
       ...prevVars,
       first: first,
     };
   },
   getVariables(props, {first, cursor}, fragmentVariables) {
    first = 10;
    const name = props.labbookName;

     return {
       first,
       cursor,
       name,
       owner
       // in most cases, for variables other than connection filters like
       // `first`, `after`, etc. you may want to use the previous values.
       //orderBy: fragmentVariables.orderBy,
     };
   },
   query: graphql`
    query CustomDependenciesPaginationQuery($first: Int!, $cursor: String!){
     labbook{
       environment{
         ...CustomDependencies_environment
       }
     }
   }`
}
)

//vendor
import React, { Component } from 'react'
import {createPaginationContainer, graphql} from 'react-relay'
//components
import CustomDependenciesDropdown from './CustomDependenciesDropdown'
import Loader from 'Components/shared/Loader'
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
      customDependencies: []
    };

    this._openModal = this._openModal.bind(this)
    this._hideModal = this._hideModal.bind(this)
    this._setComponent = this._setComponent.bind(this)
    this._addDependency = this._addDependency.bind(this)
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

    customDependencies.push(customDependencyEdge)

    this.setState({'customDependencies': customDependencies})
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


  render(){

    const {customDependencies} = this.props.environment;

    let editDisabled = ((this.props.containerStatus) && (this.props.containerStatus.state.imageStatus === "BUILD_IN_PROGRESS")) ? true : false;

    console.log(customDependencies)
    if (customDependencies) {
      return(
        <div className="CustomDependencies">

            <div className="CustomDependencies__header-container">
              <h4 className="CustomDependencies__header">
                Custom Dependencies
              </h4>
            </div>
            <div className="CustomDependencies__card">
            <div className="CustomDependencies__add-dependencies">
              <button className="CustomDependencies__button">Add Dependencies</button>
              <div className="CustomDependencies__view-container">
                <CustomDependenciesDropdown
                  addDependency={this._addDependency}
                  removeDependency={this._removeDependency}
                />

                <div className="CustomDependencies__list">
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
                </div>
              </div>
            </div>

            <div className="CustomDependencies__info">
              {
                customDependencies.edges.map((edge, index) => {
                  if(edge.node){
                    return this._customDependencyItem(edge, index)
                  }
                })
              }
            </div>
            </div>
        </div>

      )
    }
  }

  _customDependencyItem(edge, index){
      if(edge.node.info){
        return(
          <div
            key={this.props.labbookName + edge.node.id + index} className="CustomDependencies__dependencies">
            <div className="CustomDependencies__card">

                <div className="CustomDependencies__image-container">
                  <img
                    height="50"
                    width="50"
                    src={edge.node.info.icon}
                    alt={edge.node.info.humanName} />
                </div>

                <div className="CustomDependencies__card-text">
                  <p>{edge.node.info.humanName}</p>
                  <p>{edge.node.info.description}</p>
                </div>

            </div>
        </div>)
    }else{
      return(
        <div
          key={this.props.labbookName + edge.node.id + index} className="CustomDependencies__dependencies">
          <div className="CustomDependencies__card">

              <div className="CustomDependencies__image-container">
                <img
                  height="50"
                  width="50"
                  src={''}
                  alt={'no-package'} />
              </div>

              <div className="CustomDependencies__card-text">
                <p>{'issue with package'}</p>
                <p>{'this package had trouble rendering metadata'}</p>
              </div>

          </div>
      </div>)
    }
  }
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

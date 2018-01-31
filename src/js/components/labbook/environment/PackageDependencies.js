//vendor
import React, { Component } from 'react'
import {createPaginationContainer, graphql} from 'react-relay'
//components
import Loader from 'Components/shared/Loader'
//store
import store from 'JS/redux/store'
let totalCount = 2
let owner
class PackageManagerDependencies extends Component {
  constructor(props){
    super(props);
    const {labbookName} = store.getState().routes
    owner = store.getState().routes.owner //TODO clean this up when fixing dev environments
    this.state = {
      'modal_visible': false,
      owner,
      labbookName
    };
    //bind functions here
    this._openModal = this._openModal.bind(this)
    this._hideModal = this._hideModal.bind(this)
    this._setBaseImage = this._setBaseImage.bind(this)
    this._setComponent = this._setComponent.bind(this)
    this._loadMore = this._loadMore.bind(this)
  }
  /*
    handle state and addd listeners when component mounts
  */
  componentDidMount() {
    this._loadMore() //routes query only loads 2, call loadMore
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
     100, // Fetch the next 100 feed items
     (response, error) => {
       if(error){
         console.error(error)
       }

       if(self.props.environment.packageDependencies &&
         self.props.environment.packageDependencies.pageInfo.hasNextPage) {

         self._loadMore()
       }
     }
   );
  }
  /**
  *  @param {None}
  *  open modal sets state
  */
  _openModal = () =>{
      this.setState({'modal_visible': true})
      if(document.getElementById('modal__cover')){
        document.getElementById('modal__cover').classList.remove('hidden')
      }
  }
  /**
  *  @param {None}
  *  hides modal
  */
  _hideModal = () => {
      this.setState({'modal_visible': false})
      if(document.getElementById('modal__cover')){
        document.getElementById('modal__cover').classList.add('hidden')
      }

  }
  /**
  *  @param {None}
  *  set readyToBuild state to true
  */
  _setBaseImage = (baseImage) => {
    this.setState({"readyToBuild": true})
  }

  /**
  *  @param {Object}
  *  hides packagemanager modal
  */
  _setComponent = (comp) =>{
    // this.props.setContainerState("Building")
    // this.setState({"readyToBuild": true})
    this._hideModal();
  }

  render(){

    const {packageDependencies} = this.props.environment;
    const {blockClass} = this.props;

    let editDisabled = ((this.props.containerStatus) && (this.props.containerStatus.state.imageStatus === "BUILD_IN_PROGRESS")) ? true : false;


    if (packageDependencies) {
      return(
      <div className="Environment_package-manager-dependencies">

        <div className={blockClass + '__header-container'}>
          <h4 className="Environment__header">Package Dependencies</h4>
          <div className="Environment__edit-container">
            <button
              id="packageManagerEdit"
              className="Environment__edit-button"
              onClick={() => this._openModal()}
              disabled={editDisabled}
            >
            </button>
          </div>
        </div>

        <div className="Environment__info flex flex--row justify--left">
          <ul className="flex flex--row justify--left flex--wrap">
          {
            packageDependencies.edges.map((edge, index) => {
              if(edge.node){
                return(
                  this._packageListItem(edge, index)
                )
              }
            })
          }
        </ul>


      </div>
    </div>

      )
    }else{
      return(
          <Loader />
        )
    }
  }

  _packageListItem(edge, index){
    return(
      <li key={edge.node.package + edge.node.manager + index}>

          <div className="Environment__package-dependencies">

              <div className="Environment__card-text flex flex--row justify--space-around flex-1-0-auto">
                <p>{edge.node.manager}</p>
                <p>{edge.node.package}</p>
              </div>
          </div>

      </li>)
  }
}

export default createPaginationContainer(
  PackageManagerDependencies,
  {
    environment: graphql`fragment PackageDependencies_environment on Environment {
    packageDependencies(first: $first, after: $cursor) @connection(key: "PackageDependencies_packageDependencies" filters: []){
        edges{
          node{
            id
            schema
            manager
            package
            version
            latestVersion
            fromBase
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
    getConnectionFromProps(props) {

        return props.environment && props.environment.packageDependencies;
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
    let length = props.environment.packageDependencies.edges.length
    const {labbookName} = store.getState().routes

    let cursor = props.environment.packageDependencies.edges[length-1].cursor

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
    query PackageDependenciesPaginationQuery($name: String!, $owner: String!, $first: Int!, $cursor: String){
     labbook(name: $name, owner: $owner){
       environment{
         ...PackageDependencies_environment
       }
     }
   }`
}
)

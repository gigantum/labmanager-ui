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
      labbookName,
      'selectedTab': ''
    };
    //bind functions here
    this._openModal = this._openModal.bind(this)
    this._hideModal = this._hideModal.bind(this)
    this._setBaseImage = this._setBaseImage.bind(this)
    this._setComponent = this._setComponent.bind(this)
    this._loadMore = this._loadMore.bind(this)
    this._setSelectedTab = this._setSelectedTab.bind(this)
  }
  /*
    handle state and addd listeners when component mounts
  */
  componentDidMount() {
    this._loadMore() //routes query only loads 2, call loadMore
    if(this.state.selectedTab === ''){
      this.setState({selectedTab: this.props.base.packageManagers[0]})
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
  /**
  *  @param {Object}
  *  hides packagemanager modal
  */
  _setSelectedTab(tab){
    this.setState({'selectedTab': tab})
  }
  /**
  *  @param {Object}
  *  hides packagemanager modal
  */
  _filterPackageDependencies(packageDependencies){
    let packages = packageDependencies.edges.filter((edge)=>{
      console.log(edge, (edge.node && (edge.node.manager === this.state.selectedTab)))
      return edge.node && (edge.node.manager === this.state.selectedTab)
    })
    console.log(packages)
    return packages
  }
  render(){

    const {packageDependencies} = this.props.environment;
    const {blockClass, base} = this.props;



    if(packageDependencies) {

      let filteredPackageDependencies = this._filterPackageDependencies(packageDependencies)
      console.log(filteredPackageDependencies)
      return(
      <div className="PackageDependencies">

        <div className={blockClass + '__header-container'}>
          <h4 className="PackageDependencies__header">Package Dependencies</h4>
        </div>


        <div className="PackageDependencies__card">
          <div className="PackageDependencies__tabs">
            <ul>
            {
              base.packageManagers.map((tab) => {
                return(<li onClick={() => this._setSelectedTab(tab)}>{tab}</li>)
              })
            }
          </ul>

          </div>
          <div>
            <table className="flex flex--row justify--left flex--wrap">
              <thead>
                <tr>
                  <th>Dependency Name</th>
                  <th>Current</th>
                  <th>Latesr</th>
                  <th>Installed By</th>
                </tr>
              </thead>
              <tbody>
              {
                filteredPackageDependencies.map((edge, index) => {
                  if(edge.node){
                    return(
                      this._packageRow(edge, index)
                    )
                  }
                })
              }
              </tbody>
            </table>
        </div>
      </div>
    </div>

      )
    }else{
      return(
          <Loader />
        )
    }
  }

  _packageRow(edge, index){
    return(
      <tr key={edge.node.package + edge.node.manager + index}>

        <td>{edge.node.package}</td>
        <td>{edge.node.package}</td>
        <td>{edge.node.manager}</td>
        <td>{edge.node.package}</td>


      </tr>)
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

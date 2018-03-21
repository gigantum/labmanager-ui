//vendor
import React, { Component } from 'react'
import {createPaginationContainer, graphql} from 'react-relay'
import classNames from 'classnames'
import uuidv4 from 'uuid/v4'
//components
import Loader from 'Components/shared/Loader'
//store
import store from 'JS/redux/store'
//Mutations
import AddPackageComponentMutation from 'Mutations/environment/AddPackageComponentMutation'
import RemovePackageComponentMutation from 'Mutations/environment/RemovePackageComponentMutation'
//helpers
import PackageLookup from './PackageLookup'
//config
import config from 'JS/config'


let totalCount = 2
let owner, unsubscribe
class PackageDependencies extends Component {
  constructor(props){
    super(props);

    const {labbookName} = store.getState().routes
    owner = store.getState().routes.owner //TODO clean this up when fixing dev environments

    this.state = {
      owner,
      labbookName,
      'selectedTab': '',
      'packageMenuVisible': false,
      'packageName': '',
      'version': '',
      'packages': [],
      'searchValue': '',
      'forceRender': false,
      'disableInstall': false
    };
    //bind functions here
    this._loadMore = this._loadMore.bind(this)
    this._setSelectedTab = this._setSelectedTab.bind(this)
  }
  /*
    handle state and addd listeners when component mounts
  */
  componentDidMount() {
    if(this.props.environment.packageDependencies.pageInfo.hasNextPage){

      this._loadMore() //routes query only loads 2, call loadMore
    }else{
      this._refetch()
    }

    if(this.state.selectedTab === ''){
      this.setState({selectedTab: this.props.base.packageManagers[0]})
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

    if(this.state.packageMenuVisible !== environmentStore.packageMenuVisible){
      this.setState({packageMenuVisible: environmentStore.packageMenuVisible});//triggers re-render when store updates
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

       if(self.props.environment.packageDependencies &&
         self.props.environment.packageDependencies.pageInfo.hasNextPage) {

         self._loadMore()
       }else{
         self._refetch()
       }
     }
   );
  }
  /*
    @param
    refetches package dependencies
  */
  _refetch(){

    let self = this;
    let relay = this.props.relay
    let packageDependencies = this.props.environment.packageDependencies

    if(packageDependencies.edges.length > 0){

      let cursor =  packageDependencies.edges[packageDependencies.edges.length - 1].node.cursor

      relay.refetchConnection(
        totalCount + 5,
        (response) =>{

          self.setState({forceRender: true})
        },
        {
          hasNext: true,
          cursor: cursor
        }
      )
    }
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
    let searchValue = this.state.searchValue.toLowerCase()
    let packages = packageDependencies.edges.filter((edge)=>{
      return edge && edge.node && (edge.node.manager === this.state.selectedTab)
    }).filter((edge)=>{
      let name = edge && edge.node && edge.node.package ? edge.node.package.toLowerCase() : ''
      let searchMatch = ((searchValue === '') || (name.indexOf(searchValue) > -1))
      return searchMatch
    })

    return packages
  }
  /**
  *  @param {object} node
  *  triggers remove package mutation
  */
  _removePackage(node){
    const {status} = store.getState().containerStatus;
    const canEditEnvironment = config.containerStatus.canEditEnvironment(status)

    if(navigator.onLine){
      if(canEditEnvironment){
        const {labbookName, owner} = store.getState().routes
        const {environmentId} = this.props
        const clinetMutationId = uuidv4()
        let self = this

        RemovePackageComponentMutation(
          labbookName,
          owner,
          node.manager,
          node.package,
          node.id,
          clinetMutationId,
          environmentId,
          'PackageDependencies_packageDependencies',
          (response, error) => {
            if(error){
              console.log(error)
            }
            self.props.buildCallback()
          }
        )
      }else{
        this._promptUserToCloseContainer()
      }
    } else {
      store.dispatch({
        type: 'ERROR_MESSAGE',
        payload:{
          message: `Cannot remove package at this time.`,
          messageBody: [{message: 'An internet connection is required to modify the environment.'}]
        }
      })
    }
  }
  /**
  *  @param {object} node
  *  triggers remove package mutation
  */
  _toggleAddPackageMenu(){
    const {status} = store.getState().containerStatus;
    const canEditEnvironment = config.containerStatus.canEditEnvironment(status)

    if(navigator.onLine){
      if(canEditEnvironment){
        store.dispatch({
          type: 'TOGGLE_PACKAGE_MENU',
          payload:{
            packageMenuVisible: !this.state.packageMenuVisible
          }
        })
      }else{
        this._promptUserToCloseContainer()
      }
    } else {
      store.dispatch({
        type: 'ERROR_MESSAGE',
        payload:{
          message: `Cannot add package at this time.`,
          messageBody: [{message: 'An internet connection is required to modify the environment.'}]
        }
      })
    }
  }
  /**
  *  @param {evt}
  *  updates package name in components state
  */
  _updatePackageName(evt){
    this.setState({packageName: evt.target.value})
    if(evt.key === 'Enter'){
      this._addStatePackage(evt)

    }
  }
  /**
  *  @param {evt}
  *  updates package version in components state
  */
  _updateVersion(evt){
    this.setState({'version': evt.target.value})
    if(evt.key === 'Enter'){
      this._addStatePackage(evt)
    }
  }
  /**
  *  @param {}
  *  updates packages in state
  */
  _addStatePackage(){
    let packages = this.state.packages
    const {packageName, version} = this.state
    const manager = this.state.selectedTab
    let packageIndex = packages.length;

    packages.push({
      packageName,
      version,
      manager,
      validity: 'checking'
    })

    this.setState({
      packages,
      packageName: '',
      version: '',

    })


      PackageLookup.query(manager, packageName, version).then((response)=>{
        let packageIndex;
        packages.forEach((packageItem, index)=>{
          if(packageItem.packageName === packageName){
            packageIndex = index;
          }
        })
        packages.splice(packageIndex, 1);
        if(response.errors){
            store.dispatch({
              type:"ERROR_MESSAGE",
              payload: {
                message: `Error occured looking up ${packageName}`,
                messageBody: response.errors
              }
            })

        }
        else{
          packages.push({
            packageName,
            version: response.data.package.version,
            latestVersion: response.data.package.latestVersion,
            manager,
            validity: 'valid'
          })

        }

      this.setState({
        packages
      })
    })

    this.inputPackageName.value = ""
    this.inputVersion.value = ""
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
      type: 'CONTAINER_MENU_WARNING',
      payload: {
        message: 'Stop LabBook before editing the environment. \n Be sure to save your changes.'
      }
    })
  }
  /**
  *  @param {}
  *  updates packages in state
  */
  _removeStatePackages(node, index){
    let packages = this.state.packages
    packages.splice(index, 1)
    this.setState({
      packages
    })

  }
  /**
  *  @param {}
  *  triggers add package mutation
  */
  _addPackageComponentMutation(){
    const {packages} = this.state
    const {labbookName, owner} = store.getState().routes
    const {environmentId} = this.props


    this.setState({disableInstall: true})
    let self = this,
        index = 0

    function addPackage(packageItem){
      const messageVersion = (packageItem.version === '') ? 'latest' : packageItem.version
      const version = (packageItem.version === '') ? null : packageItem.version
      store.dispatch({
        type: 'INFO_MESSAGE',
        payload: {
          message: `Installing ${packageItem.packageName} at ${messageVersion} with ${packageItem.manager}`,
        }
      })

      AddPackageComponentMutation(
        labbookName,
        owner,
        packageItem.manager,
        packageItem.packageName,
        version,
        index+1,
        environmentId,
        'PackageDependencies_packageDependencies',
        (response, error) => {
          self.setState({disableInstall: false})
          if(error){
            console.log(error)
            store.dispatch({
              type: 'ERROR_MESSAGE',
              payload: {
                message: `Error adding ${packageItem.packageName}`,
                messageBody: error
              }
            })

          }else{

            index++
            if(packages[index]){
              addPackage(packages[index])
            }else{
              self.setState({packages: []})
              self.props.buildCallback()
            }
          }
        }
      )
    }
    addPackage(packages[index])
  }

  /**
  *  @param {evt}
  *  remove dependency from list
  */
  _setSearchValue(evt){
    this.setState({'searchValue': evt.target.value})
  }
  /***
  *  @param {evt}
  *  get tabs data
  **/
  _getPackmanagerTabs(){
    let tabs = this.props.base.packageManagers.map((packageName) => {
      let count = 0
      this.props.environment.packageDependencies.edges.forEach((edge)=> {

        if(packageName === edge.node.manager){
          count++
        }
      })
      return {tabName: packageName, count: count}
    })
    return tabs
  }


  render(){

    const {packageDependencies} = this.props.environment
    const {blockClass} = this.props

    const  packageManagersTabs = this._getPackmanagerTabs()

    if(packageDependencies) {

      let filteredPackageDependencies = this._filterPackageDependencies(packageDependencies)
      let packageMenu = classNames({
        'PackageDependencies__menu': true,
        'PackageDependencies__menu--min-height':!this.state.packageMenuVisible
      })
      let packagesProcessing = this.state.packages.filter(packageItem =>{
        return packageItem.validity === 'checking'
      })

      let addPackageCSS = classNames({
        'PackageDependencies__button': true, 'PackageDependencies__button--line-18': true,
        'PackageDependencies__button--open': this.state.packageMenuVisible
      })

      let disableInstall = this.state.disableInstall || ((this.state.packages.length === 0) || (packagesProcessing.length > 0))
      return(
      <div className="PackageDependencies">

        <div className={blockClass + '__header-container'}>
          <h4 className="PackageDependencies__header">Packages</h4>
        </div>

        <div className="PackageDependencies__card">
          <div className="PackageDependencies__tabs">
            <ul className="PackageDependencies__tabs-list">
            {
              packageManagersTabs.map((tab, index) => {
                let packageTab = classNames({
                  'PackageDependencies__tab': true,
                  'PackageDependencies__tab--selected': (this.state.selectedTab === tab.tabName)
                })

                return(<li
                  key={tab + index}
                  className={packageTab}
                  onClick={() => this._setSelectedTab(tab.tabName)}>{`${tab.tabName} (${tab.count})`}
                </li>)
              })
            }
          </ul>

          </div>
          <div className="PackageDependencies__add-package">
            <button
              onClick={()=> this._toggleAddPackageMenu()}
              className={addPackageCSS}>
              Add Packages
            </button>
            <div className={packageMenu}>
              <div className="PackageDependencies__package-menu">
                <input
                  ref={el => this.inputPackageName = el}
                  className="PackageDependencies__input-text"
                  placeholder="Enter Dependency Name"
                  type="text"
                  onKeyUp={(evt)=>this._updatePackageName(evt)} />
                <input
                  ref={el => this.inputVersion = el}
                  className="PackageDependencies__input-text--version"
                  placeholder="Version (Optional)"
                  disabled={this.state.selectedTab === 'apt'}
                  type="text"
                  onKeyUp={(evt)=>this._updateVersion(evt)} />
                <button
                  disabled={(this.state.packageName.lenght === 0)}
                  onClick={()=>this._addStatePackage()}
                  className="PackageDependencies__button--round PackageDependencies__button--add"></button>
              </div>

              <div className="PackageDependencies__table--border">
                <table>
                  <tbody>
                    {
                      this.state.packages.map((node, index)=>{

                        const version = node.version === '' ? 'latest' : `v${node.version}`
                        return (
                          <tr
                            className={`PackageDependencies__table-row--${node.validity}` }
                            key={node.packageName + node.version}>
                            <td>{`${node.packageName}`}</td>
                            <td>{version}</td>
                            <td className="PackageDependencies__table--no-right-padding" width="30">
                              <button className="PackageDependencies__button--round PackageDependencies__button--remove"
                                onClick={()=>this._removeStatePackages(node, index)}>
                              </button>
                            </td>
                          </tr>)
                      })
                    }
                  </tbody>
                </table>
                <button
                  className="PackageDependencies__button--absolute"
                  onClick={()=> this._addPackageComponentMutation()}
                  disabled={disableInstall}>
                  Install Selected Packages
                </button>
            </div>
          </div>
        </div>
        <div className="PackageDependencies__table-container">
          {
          //Awaiting new UI design due to user confusion
          /* <input
            type="text"
            className="full--border"
            placeholder="Filter dependencies by keyword"
            onKeyUp={(evt)=> this._setSearchValue(evt)}
          /> */
          }
          <table className="PackageDependencies__table">
            <thead>
              <tr>
                <th>Package Name</th>
                <th>Current</th>
                <th>Latest</th>
                <th>Installed By</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
            {
              filteredPackageDependencies.filter(edge => edge.node).map((edge, index) => {
                  return(
                    this._packageRow(edge, index)
                  )
              })
            }
            </tbody>
          </table>
      </div>
      </div>
    </div>)
    }else{
      return(<Loader />)
    }
  }

  _packageRow(edge, index){
    const installer = edge.node.fromBase ? 'System' : 'User'
    const {version, latestVersion} = edge.node
    const versionText = version ?  `v${version}` : ''
    const latestVersionText = latestVersion ?  `v${latestVersion}` : ''

    return(
      <tr key={edge.node.package + edge.node.manager + index}>
        <td>{edge.node.package}</td>
        <td>{versionText}</td>
        <td>{latestVersionText}</td>
        <td>{installer}</td>
        <td width="60">
          <button
          className="PackageDependencies__button--round PackageDependencies__button--remove"
          disabled={edge.node.fromBase}
          onClick={() => this._removePackage(edge.node)}>
          </button>
        </td>
      </tr>)
  }
}

export default createPaginationContainer(
  PackageDependencies,
  {
    environment: graphql`fragment PackageDependencies_environment on Environment {
    packageDependencies(first: $first, after: $cursor) @connection(key: "PackageDependencies_packageDependencies", filters: []){
        edges{
          node{
            id
            schema
            manager
            package
            version
            latestVersion @include(if: $hasNext)
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
    let hasNext = !props.environment.packageDependencies.pageInfo.hasNextPage

    first = hasNext ? first + 1 : first

     return {
       first,
       cursor,
       name: labbookName,
       owner,
       hasNext
       // in most cases, for variables other than connection filters like
       // `first`, `after`, etc. you may want to use the previous values.
       //orderBy: fragmentVariables.orderBy,
     };
   },
   query: graphql`
    query PackageDependenciesPaginationQuery($name: String!, $owner: String!, $first: Int!, $cursor: String, $hasNext: Boolean!){
     labbook(name: $name, owner: $owner){
       environment{
         ...PackageDependencies_environment
       }
     }
   }`
}
)

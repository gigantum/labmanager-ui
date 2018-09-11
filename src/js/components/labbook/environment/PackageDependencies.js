//vendor
import React, { Component } from 'react'
import {createPaginationContainer, graphql} from 'react-relay'
import classNames from 'classnames'
import uuidv4 from 'uuid/v4'
import { connect } from 'react-redux'

//components
import ButtonLoader from 'Components/shared/ButtonLoader'
import Loader from 'Components/shared/Loader'
import ToolTip from 'Components/shared/ToolTip';
//store
import store from 'JS/redux/store'
import {
  setLatestFetched,
  setForceRefetch,
  setForceCancelRefetch,
  setLatestPackages,
  setRefetchOccuring,
  setRefetchQueued,
  setPackageMenuVisible,
} from 'JS/redux/reducers/labbook/environment/packageDependencies'
import { setErrorMessage, setWarningMessage } from 'JS/redux/reducers/footer'
import { setContainerMenuWarningMessage} from 'JS/redux/reducers/labbook/environment/environment'
import { setBuildingState} from 'JS/redux/reducers/labbook/labbook'
import { setLookingUpPackagesState} from 'JS/redux/reducers/labbook/containerStatus'
//Mutations
import AddPackageComponentsMutation from 'Mutations/environment/AddPackageComponentsMutation'
import RemovePackageComponentsMutation from 'Mutations/environment/RemovePackageComponentsMutation'
//helpers
import PackageLookup from './PackageLookup'
//config
import config from 'JS/config'


let totalCount = 2
let owner
let updateCheck = {}

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
      'disableInstall': false,
      'installDependenciesButtonState': '',
      'hardDisable': false,
      'latestVersion': store.getState().packageDependencies.latestPackages,
      'removalPackages': {},
      'updatePackages': {},
      'currentPackages': this.props.environment.packageDependencies
    };

    //bind functions here
    this._loadMore = this._loadMore.bind(this)
    this._setSelectedTab = this._setSelectedTab.bind(this)
    this._addPackageComponentsMutation = this._addPackageComponentsMutation.bind(this)
    this._updatePackages = this._updatePackages.bind(this)
    this._refetch = this._refetch.bind(this)
  }

  static getDerivedStateFromProps(props, state) {

    return state;
  }

  componentDidUpdate(){
    if(this.props.forceRefetch){
      this._refetch();
      this.props.setForceRefetch(false)
    }
    if(this.props.forceCancelRefetch){
      if(this.pendingRefetch){
        this.pendingRefetch.dispose();
      }
      this.props.setForceCancelRefetch(false)
    }

    let newPackages= this.props.environment.packageDependencies

    if(newPackages.edges && newPackages.edges.length < 3 && newPackages.pageInfo.hasNextPage){
      this._loadMore();
    }

    if(newPackages.edges && newPackages.edges[0] && newPackages.edges[0].node.latestVersion){
      let latestPackages = {};

      newPackages.edges.forEach(({node}) =>{
        if (latestPackages[node.manager]) {
          latestPackages[node.manager][node.package] = node.latestVersion
        } else {
          latestPackages[node.manager] = {[node.package]: node.latestVersion}
        }

        if(updateCheck[node.manager] && updateCheck[node.manager][node.package]){
          if(updateCheck[node.manager][node.package].oldVersion !== node.latestVersion){
            updateCheck[node.manager][node.package].version = node.latestVersion
          } else{
            delete updateCheck[node.manager][node.package]
          }
        }

      })
      if(JSON.stringify(latestPackages) !== JSON.stringify(this.props.latestPackages)){
        this.props.setLatestPackages(latestPackages)
      }
    }

    let newUpdatePackages = Object.assign({}, this.state.updatePackages, updateCheck)
    Object.keys(newUpdatePackages).forEach(manager =>{
      Object.keys(newUpdatePackages[manager]).forEach((pkg) =>{

        if(!newUpdatePackages[manager][pkg].version){
          delete newUpdatePackages[manager][pkg]
        }

      })
    })

    if(JSON.stringify(newUpdatePackages) !== JSON.stringify(this.state.updatePackages)){
      this.setState({updatePackages: newUpdatePackages})
    }
    updateCheck = {}
  }

  /*
    handle state and addd listeners when component mounts
  */
  componentDidMount() {
    if(this.props.environment.packageDependencies.pageInfo.hasNextPage){
      this._loadMore() //routes query only loads 2, call loadMore
    } else{
      if(!store.getState().packageDependencies.latestFetched){
        this.props.setLatestFetched(true)
        this._refetch();
      }
    }

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
    totalCount += 5;
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
    if(!store.getState().packageDependencies.refetchOccuring){
      let self = this;
      let relay = this.props.relay
      let packageDependencies = this.props.environment.packageDependencies

      if(packageDependencies.edges.length > 0){
        this.props.setRefetchOccuring(true)

        self.pendingRefetch = relay.refetchConnection(
          null,
          () =>{
            this.props.setRefetchOccuring(false)

            if(store.getState().packageDependencies.refetchQueued){
              this.props.setRefetchQueued(false)
              self._refetch();
            }
            self.setState({forceRender: true})
          },
          {
            first: 1000,
            hasNext: true,
            cursor: null,
          }
        )
        // disposible.dispose()
      }
    } else{
      this.props.setRefetchQueued(true)
    }
  }
  /**
  *  @param {Object}
  *  hides packagemanager modal
  */
  _setSelectedTab(tab, isSelected){
    this.setState({'selectedTab': tab, packageMenuVisible: isSelected ? this.props.packageMenuVisible : false, packages: isSelected ? this.state.packages : []})
  }
  /**
  *  @param {Object}
  *  hides packagemanager modal
  */
  _filterPackageDependencies(packageDependencies){
      let searchValue = this.state.searchValue && this.state.searchValue.toLowerCase()

      let packages = packageDependencies.edges.filter((edge) => {

        return edge && edge.node && (edge.node.manager === this.state.selectedTab)
      }).filter((edge) => {

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
  _removePackage(){
    const {status} = store.getState().containerStatus;
    const canEditEnvironment = config.containerStatus.canEditEnvironment(status) && !this.props.isLocked
    let self = this
    this.setState({hardDisable: true})

    if(navigator.onLine){

      if(canEditEnvironment){

        if(!this.state.hardDisable){

          const {labbookName, owner} = store.getState().routes
          const {environmentId} = this.props
          const manager = this.state.selectedTab
          const removalPackages = Object.keys(this.state.removalPackages[manager])
          const RemovalIDArr = Object.values(this.state.removalPackages[manager])
          const clientMutationId = uuidv4()

          this.setState({removalPackages: {}, updatePackages: {}})

          RemovePackageComponentsMutation(
            labbookName,
            owner,
            manager,
            removalPackages,
            RemovalIDArr,
            clientMutationId,
            environmentId,
            'PackageDependencies_packageDependencies',
            (response, error) => {

              if(error){
                console.log(error)
              }

              this.setState({hardDisable: false})
              self.props.buildCallback()
            }
          )
        }
      }else{

        this._promptUserToCloseContainer()
        this.setState({hardDisable: false})
      }
    } else {
      this.props.setErrorMessage(`Cannot remove package at this time.`, [{message: 'An internet connection is required to modify the environment.'}])
    }
  }
  /**
  *  @param {object} node
  *  triggers remove package mutation
  */
  _toggleAddPackageMenu(){
    const {status} = store.getState().containerStatus;
    const canEditEnvironment = config.containerStatus.canEditEnvironment(status) && !this.props.isLocked

    if(navigator.onLine){
      if(canEditEnvironment){
        this.props.setPackageMenuVisible(!this.props.packageMenuVisible)
      }else{

        this._promptUserToCloseContainer()
      }
    } else {
      this.props.setErrorMessage(`Cannot add package at this time.`, [{message: 'An internet connection is required to modify the environment.'}])
    }
  }
  /**
  *  @param {evt}
  *  updates package name in components state
  */
  _updatePackageName(evt){

    this.setState({packageName: evt.target.value})

    if(evt.key === 'Enter' && evt.target.value.length){

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

    let {packageName, version} = this.state
    const manager = this.state.selectedTab

    packages.push({
      package: packageName,
      version,
      manager,
      validity: 'valid'
    })

    this.setState({
      packages,
      packageName: '',
      version: '',
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
    this.props.setContainerMenuWarningMessage('Stop Project before editing the environment. \n Be sure to save your changes.')
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
  _addPackageComponentsMutation(){
    let self = this,
        {packages} = this.state,
        filteredInput = [];

    const {labbookName, owner} = store.getState().routes,
          {environmentId} = this.props;

    packages = packages.map((pkg) => {
      pkg.validity = 'checking'
      filteredInput.push({manager: pkg.manager, package: pkg.package, version: pkg.version})
      return pkg;
    }).slice()

    this.setState({
      packages,
      disableInstall: true,
      installDependenciesButtonState: 'loading'
    })

    this.props.setBuildingState(true)
    this.props.setLookingUpPackagesState(true)
    PackageLookup.query(labbookName, owner, filteredInput).then((response)=>{
      this.props.setLookingUpPackagesState(false)
      if(response.errors){
        packages = packages.map((pkg) => {
          pkg.validity = 'valid'
          return pkg;
        })
        this.setState({disableInstall: false, installDependenciesButtonState: 'error', packages})
        setTimeout(()=>{
          self.setState({installDependenciesButtonState: ''})
        }, 2000)
        this.props.setErrorMessage(`Error occured looking up packages`, response.errors)

        this.props.setBuildingState(false)

      } else{
        let resPackages = response.data.labbook.packages;
        let invalidCount = 0;
        let lastInvalid = null;
        resPackages = resPackages.map((pkg) =>{
          if(pkg.isValid){
            pkg.validity = 'valid'
          } else {
            pkg.validity = 'invalid'
            invalidCount++;
            lastInvalid = {package: pkg.package, manager: pkg.manager}
          }
          return pkg
        })
        this.setState({packages: resPackages})

        if(invalidCount){
          let message = invalidCount === 1 ? `Unable to find package '${lastInvalid.package}'.` : `Unable to find ${invalidCount} packages.`
          this.props.setErrorMessage('Packages could not be installed', [{message}])
          this.props.setBuildingState(false)
          this.setState({disableInstall: false, installDependenciesButtonState: ''})
        } else {
          filteredInput = [];
          let flatPackages = [];
          let versionReference = {};
          const existingPackages = this.props.environment.packageDependencies
          resPackages.forEach((pkg) => {
            flatPackages.push(pkg.package)
          })

          let duplicates = existingPackages.edges.reduce((filtered, option) =>{

            if(flatPackages.indexOf(option.node.package) > -1){
              filtered.push(option.node.id)
              versionReference[option.node.package] = option.node.version
            }

            return filtered
          }, []);

          resPackages = resPackages.forEach((pkg) => {
            versionReference[pkg.package] !== pkg.version ? filteredInput.push({package: pkg.package, manager: pkg.manager, version: pkg.version}) : duplicates.splice(duplicates.indexOf(pkg.id), 1)
            flatPackages.push(pkg.package)
          })

          if(filteredInput.length){

            totalCount += filteredInput.length

            AddPackageComponentsMutation(
              labbookName,
              owner,
              filteredInput,
              1,
              environmentId,
              'PackageDependencies_packageDependencies',
              duplicates,
              (response, error) => {
                if(error) {
                  this.setState({disableInstall: false, installDependenciesButtonState: 'error'})
                  setTimeout(()=>{
                    self.setState({installDependenciesButtonState: ''})
                  }, 2000)
                  this.props.setErrorMessage(`Error adding packages.`, error)
                } else {
                  self.props.buildCallback(true)
                  self.setState({
                    disableInstall: false,
                    packages: [],
                    installDependenciesButtonState: 'finished'
                  })
                  setTimeout(()=>{
                  self.setState({installDependenciesButtonState: ''})
                  }, 2000)
                }
              }
            )
          } else {
            this.props.setWarningMessage(`All packages attempted to be installed already exist.`)
            this.props.setBuildingState(false)
            self.setState({
              disableInstall: false,
              packages: [],
              installDependenciesButtonState: 'error'
            })
            setTimeout(()=>{
              self.setState({installDependenciesButtonState: ''})
              }, 2000)
          }
        }
      }
    })
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
  /***
  *  @param {String, String} pkg manager
  *  adds to removalpackages state pending removal of packages
  **/
  _addRemovalPackage(pkg, manager, id, updateAvailable, version, oldVersion){
    let newRemovalPackages = Object.assign({}, this.state.removalPackages)
    let newUpdatePackages = Object.assign({}, this.state.updatePackages)

    if(newRemovalPackages[manager]){
      let index = Object.keys(newRemovalPackages[manager]).indexOf(pkg)

      if(index > -1) {
        delete newRemovalPackages[manager][pkg]
      } else{
        newRemovalPackages[manager][pkg] = id
      }

    } else {
      newRemovalPackages[manager] = {[pkg]: id}
    }

    if(!version){

      if(updateCheck[manager]){
        updateCheck[manager][pkg] = {id, oldVersion: oldVersion}
      } else{
        updateCheck[manager] = {[pkg]: {id, oldVersion: oldVersion}}
      }
    }

    if(updateAvailable && version){

      if(newUpdatePackages[manager]){
        let index = Object.keys(newUpdatePackages[manager]).indexOf(pkg)

        if(index > -1) {
          delete newUpdatePackages[manager][pkg]
        } else{
          newUpdatePackages[manager][pkg] = {id, version}
        }

      } else {
        newUpdatePackages[manager] = {[pkg]: {id, version}}
      }

    }

    this.setState({removalPackages: newRemovalPackages, updatePackages: newUpdatePackages})
  }

  /***
  *  @param {}
  *  processes update packages and attempts to update
  **/
  _updatePackages(){
    const {status} = store.getState().containerStatus;
    const canEditEnvironment = config.containerStatus.canEditEnvironment(status) && !this.props.isLocked
    let self = this

    if(navigator.onLine){

      if(canEditEnvironment){

        const {labbookName, owner} = store.getState().routes
        const {environmentId} = this.props
        let filteredInput = [];
        let duplicates = []

        Object.keys(this.state.updatePackages).forEach(manager =>{
          Object.keys(this.state.updatePackages[manager]).forEach(pkg =>{
            filteredInput.push({manager, package: pkg, version: this.state.updatePackages[manager][pkg].version })
            duplicates.push(this.state.updatePackages[manager][pkg].id)
          })
        })

        AddPackageComponentsMutation(
          labbookName,
          owner,
          filteredInput,
          1,
          environmentId,
          'PackageDependencies_packageDependencies',
          duplicates,
          (response, error) => {
            this.setState({removalPackages: {}, updatePackages: {}})
            if(error) {
              this.setState({disableInstall: false, installDependenciesButtonState: 'error'})
              setTimeout(()=>{
                self.setState({installDependenciesButtonState: ''})
              }, 2000)
              this.props.setErrorMessage(`Error adding packages.`, error)
            } else {
              self.props.buildCallback(true)
              self.setState({
                disableInstall: false,
                packages: [],
                installDependenciesButtonState: 'finished'
              })
              setTimeout(()=>{
              self.setState({installDependenciesButtonState: ''})
              }, 2000)
            }
          }
        )
      }else{
        this._promptUserToCloseContainer()
      }
    } else {
      this.props.setErrorMessage(`Cannot remove package at this time.`, [{message: 'An internet connection is required to modify the environment.'}])
    }
  }


  render(){
    const {packageDependencies} = this.props.environment

    const packageManagersTabs = this._getPackmanagerTabs()

    const noRemovalPackages = ((!this.state.removalPackages[this.state.selectedTab]) || (this.state.removalPackages[this.state.selectedTab] && !Object.keys(this.state.removalPackages[this.state.selectedTab]).length))

    const updateButtonAvailable = this.state.removalPackages[this.state.selectedTab] && this.state.updatePackages[this.state.selectedTab] && Object.keys(this.state.removalPackages[this.state.selectedTab]).length === Object.keys(this.state.updatePackages[this.state.selectedTab]).length

    const removeButtonCSS = classNames({
      'PackageDependencies__remove-button--full' : !updateButtonAvailable,
      'PackageDependencies__remove-button--half': updateButtonAvailable
    })

    if(packageDependencies) {

      let filteredPackageDependencies = this._filterPackageDependencies(packageDependencies)
      let packageMenu = classNames({
        'PackageDependencies__menu': true,
        'PackageDependencies__menu--min-height':!this.props.packageMenuVisible
      })
      let packagesProcessing = this.state.packages.filter(packageItem =>{
        return packageItem.validity === 'checking'
      })

      let addPackageCSS = classNames({
        'PackageDependencies__button': true, 'PackageDependencies__button--line-18': true,
        'PackageDependencies__button--open': this.props.packageMenuVisible
      })

      let disableInstall = this.state.disableInstall || ((this.state.packages.length === 0) || (packagesProcessing.length > 0))

      return(
      <div className="PackageDependencies">
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
                  onClick={() => this._setSelectedTab(tab.tabName, this.state.selectedTab === tab.tabName)}>{`${tab.tabName} (${tab.count})`}
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
                  disabled={packagesProcessing.length > 0}
                  className="PackageDependencies__input-text"
                  placeholder="Enter Dependency Name"
                  type="text"
                  onKeyUp={(evt)=>this._updatePackageName(evt)} />
                <input
                  ref={el => this.inputVersion = el}
                  className="PackageDependencies__input-text--version"
                  placeholder="Version (Optional)"
                  disabled={this.state.selectedTab === 'apt' || (packagesProcessing.length > 0)}
                  type="text"
                  onKeyUp={(evt)=>this._updateVersion(evt)} />
                <button
                  disabled={(this.state.packageName.length === 0)}
                  onClick={()=>this._addStatePackage()}
                  className="PackageDependencies__button--round PackageDependencies__button--add"></button>
              </div>

              <div className="PackageDependencies__table--border">
                <table>
                  <tbody>
                    {
                      this.state.packages.map((node, index)=>{
                        const version = node.version === '' ? 'latest' : `${node.version}`
                        const versionText = `${version === 'latest'? node.validity === 'checking' ? 'retrieving latest version' : 'latest version' : `${version}`}`
                        return (
                          <tr
                            className={`PackageDependencies__table-row--${node.validity}` }
                            key={node.package + node.version}>
                            <td className="PackageDependencies__td-package">{`${node.package}`}</td>
                            <td className="PackageDependencies__td-version">{versionText}
                            {
                              node.validity === 'checking' &&
                              <div className="PackageDependencies__version-loading"></div>
                            }

                            </td>
                            <td className="PackageDependencies__table--no-right-padding" width="30">
                            {
                              !disableInstall &&
                              <button className="PackageDependencies__button--round PackageDependencies__button--remove--adder"
                                onClick={()=>this._removeStatePackages(node, index)}>
                              </button>
                            }
                            </td>
                          </tr>)
                      })
                    }
                  </tbody>
                </table>

                <ButtonLoader
                  buttonState={this.state.installDependenciesButtonState}
                  buttonText={"Install Selected Packages"}
                  className="PackageDependencies__button--absolute"
                  params={{}}
                  buttonDisabled={disableInstall}
                  clicked={this._addPackageComponentsMutation}
                />
                {/* <button
                  className="PackageDependencies__button--absolute"
                  onClick={()=> this._addPackageComponentMutation()}
                  disabled={disableInstall}>
                  Install Selected Packages
                </button> */}
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
                {
                  noRemovalPackages ?
                  <th className="PackageDependencies__last-row">
                    Select
                  </th>
                  :
                  <th className="PackageDependencies__remove-row">
                    <div className="">
                      {
                        updateButtonAvailable &&
                          <button
                            className="PackageDependencies__update-button"
                            onClick={()=> this._updatePackages()}
                          >
                            Update
                        </button>
                      }
                      <button
                          className={removeButtonCSS}
                          onClick={()=> this._removePackage()}
                        >
                          Delete
                      </button>

                    </div>
                  </th>
                }
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
    const versionText = version ?  version : ''
    let latestVersionText = latestVersion ?  latestVersion : null

    if(!latestVersionText) {
      if(this.state.latestVersion[edge.node.manager] && this.state.latestVersion[edge.node.manager][edge.node.package]){
        latestVersionText = this.state.latestVersion[edge.node.manager][edge.node.package]
      }
    }

    let trCSS = classNames({
      'PackageDependencies__optimistic-updating': edge.node.id === undefined
    })
    let isSelected = this.state.removalPackages[edge.node.manager] && Object.keys(this.state.removalPackages[edge.node.manager]).indexOf(edge.node.package) > -1
    let buttonCSS = classNames({
      'PackageDependencies__button--round PackageDependencies__button--remove': !isSelected,
      'PackageDependencies__button--round PackageDependencies__button--remove--selected': isSelected

    })

    return(
      <tr
        className={trCSS}
         key={edge.node.package + edge.node.manager + index}>
        <td>{edge.node.package}</td>
        <td>
          {versionText}
        </td>
        <td className="PackageDependencies__latest-column">
          <span>
          {latestVersionText}
          </span>
          {
            latestVersionText && (latestVersionText !== versionText) && !edge.node.fromBase &&
            <div className="PackageDependencies__update-available"></div>
          }
        </td>
        <td>{installer}</td>
        <td width="60" className="PackageDependencies__select-row">
          <button
            className={buttonCSS}
            disabled={edge.node.fromBase || (edge.node.id === undefined)}
            onClick={() => this._addRemovalPackage(edge.node.package, edge.node.manager, edge.node.id, latestVersionText && (latestVersionText !== versionText) && !edge.node.fromBase, latestVersionText, versionText )}>
          </button>
        </td>
      </tr>)
  }
}

const mapStateToProps = (state, ownProps) => {
  return state.packageDependencies
}

const mapDispatchToProps = dispatch => {
  return {
      setLatestFetched,
      setForceRefetch,
      setForceCancelRefetch,
      setLatestPackages,
      setRefetchOccuring,
      setRefetchQueued,
      setPackageMenuVisible,
      setErrorMessage,
      setContainerMenuWarningMessage,
      setBuildingState,
      setWarningMessage,
      setLookingUpPackagesState,
  }
}

const PackageDependenciesContainer =  connect(mapStateToProps, mapDispatchToProps)(PackageDependencies);


export default createPaginationContainer(
  PackageDependenciesContainer,
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

//vendor
import React, { Component } from 'react'
import {createPaginationContainer, graphql} from 'react-relay'
//components
import AddEnvironmentPackage from 'Components/wizard/AddEnvironmentPackage'
import Loader from 'Components/shared/Loader'
let totalCount = 2
let owner
class PackageManagerDependencies extends Component {
  constructor(props){
    super(props);
    this.state = {
      'modal_visible': false
    };
    owner = this.props.owner

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

       if(self.props.environment.packageManagerDependencies &&
         self.props.environment.packageManagerDependencies.pageInfo.hasNextPage) {

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

    const {packageManagerDependencies} = this.props.environment;
    const {blockClass} = this.props;

    let editDisabled = ((this.props.containerStatus) && (this.props.containerStatus.state.imageStatus === "BUILD_IN_PROGRESS")) ? true : false;


    if (packageManagerDependencies) {
      return(
      <div className="Environment_package-manager-dependencies">
        <div className={!this.state.modal_visible ? 'Environment__modal hidden' : 'Environment__modal'}>
          <div
            id="packageManagerEditClose"
            className="Environment__modal-close"
            onClick={() => this._hideModal()}>
          </div>
          <AddEnvironmentPackage
            {...this.props}
            availablePackageManagers={(this.props.baseImage) ? this.props.baseImage.availablePackageManagers : null}
            setComponent={this._setComponent}
            nextComponent={"continue"}
            environmentView={true}
            toggleDisabledContinue={() => function(){}}
          />
        </div>

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
            packageManagerDependencies.edges.map((edge, index) => {
              return(
                this._packageListItem(edge, index)
              )
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
      <li key={edge.packageName + edge.node.packageManager + index}>

          <div className="Environment__package-dependencies">

              <div className="Environment__card-text flex flex--row justify--space-around flex-1-0-auto">
                <p>{edge.node.packageManager}</p>
                <p>{edge.node.packageName}</p>
              </div>
          </div>

      </li>)
  }
}

export default createPaginationContainer(
  PackageManagerDependencies,
  {
    environment: graphql`fragment PackageManagerDependencies_environment on Environment {
    packageManagerDependencies(first: $first, after: $cursor) @connection(key: "PackageManagerDependencies_packageManagerDependencies" filters: []){
        edges{
          node{
            id
            packageManager
            packageName
            packageVersion
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

        return props.environment && props.environment.packageManagerDependencies;
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
    let length = props.environment.packageManagerDependencies.edges.length
    let name = props.labbookName;

    let cursor = props.environment.packageManagerDependencies.edges[length-1].cursor

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
    query PackageManagerDependenciesPaginationQuery($name: String!, $owner: String!, $first: Int!, $cursor: String){
     labbook(name: $name, owner: $owner){
       environment{
         ...PackageManagerDependencies_environment
       }
     }
   }`
}
)

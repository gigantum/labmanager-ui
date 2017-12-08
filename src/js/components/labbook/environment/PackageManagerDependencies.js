//vendor
import React, { Component } from 'react'
import {createPaginationContainer, graphql} from 'react-relay'
//components
import AddEnvironmentPackage from 'Components/wizard/AddEnvironmentPackage'
import Loader from 'Components/shared/Loader'

class PackageManagerDependencies extends Component {
  constructor(props){
    super(props);
    this.state = {
      'modal_visible': false
    };

    this._openModal = this._openModal.bind(this)
    this._hideModal = this._hideModal.bind(this)
    this._setBaseImage = this._setBaseImage.bind(this)
    this._setComponent = this._setComponent.bind(this)
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
    packageManagerDependencies(first: $first, after: $cursor) @connection(key: "PackageManagerDependencies_packageManagerDependencies" filters: ["first"]){
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
        return props.labbook && props.labbook.environment;
    },
    getFragmentVariables(prevVars, first) {
      return {
       ...prevVars,
       first: first,
     };
   },
   getVariables(props, {first, cursor, name, owner}, fragmentVariables) {
    const username = localStorage.getItem('username')
    first = 10;
    name = props.labbookName;
    owner = username;
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
    query PackageManagerDependenciesPaginationQuery($first: Int!, $cursor: String!){
     labbook{
       environment{
         ...PackageManagerDependencies_environment
       }
     }
   }`
}
)

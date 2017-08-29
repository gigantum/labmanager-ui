import React, { Component } from 'react'
import {createPaginationContainer, graphql} from 'react-relay'
import AddEnvironmentPackage from './../../wizard/AddEnvironmentPackage'

let packageManager;
class PackageManagerDependencies extends Component {
  constructor(props){
    super(props);
    this.state = {'modal_visible': false};
    packageManager = this;
  }
  /*
    function()
    open modal view
  */
  _openModal(){
      this.setState({'modal_visible': true})
  }
  /*
    function()
    hide modal view
  */
  _hideModal(){
      this.setState({'modal_visible': false})
  }

  _setBaseImage(baseImage){
      this.setState({"readyToBuild": true})
  }

  _setComponent(comp){
    // packageManager.props.setContainerState("Building")
    // packageManager.setState({"readyToBuild": true})
    packageManager._hideModal();
  }


  render(){

    let packageManagerDependencies = this.props.environment.packageManagerDependencies;

    if (packageManagerDependencies) {
      return(
      <div className="Environment_package-manager-dependencies">
        <div id='modal__cover' className={!this.state.modal_visible ? 'Environment__modal hidden' : 'Environment__modal'}>
          <div
            className="Environment__modal-close"
            onClick={() => this._hideModal()}>
            X
          </div>
          <AddEnvironmentPackage
            availablePackageManagers={(this.props.baseImage) ? this.props.baseImage.availablePackageManagers : null}
            labbookName={this.props.labbookName}
            environmentId={this.props.environmentId}
            setBaseImage={this.props.setBaseImage}
            setComponent={this._setComponent}
            buildCallback={this.props.buildCallback}
            nextComponent={"continue"}
            environmentView={true}
            toggleDisabledContinue={() => function(){}}
          />
        </div>
        <h4 className="Environment__header">Package Dependencies</h4>
        <div className="Environment__info flex flex--row justify--left">
          <ul className="flex flex--row justify--left flex--wrap">
          {

            packageManagerDependencies.edges.map((edge, index) => {
              return(
                <li key={edge.packageName + edge.node.packageManager + index}>
                  <div className="Environment__package-dependencies">

                      <div className="Environment__card-text flex flex--row justify--space-around flex-1-0-auto">
                        <p>{edge.node.packageManager}</p>
                        <p>{edge.node.packageName}</p>
                      </div>
                  </div>

                </li>
              )
            })

          }
        </ul>

        <div className="Environment__edit-container">
          <button className="Environment__edit-button" onClick={() => this._openModal()}>Edit</button>
        </div>
      </div>
    </div>

      )
    }else{
      return(
          <div className="Environment">
              loading
          </div>
        )
    }
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

    first = 10;
    name = props.labbookName;
    owner = 'default';
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
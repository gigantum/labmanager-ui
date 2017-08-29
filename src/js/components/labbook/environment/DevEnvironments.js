import React, { Component } from 'react'
import {createPaginationContainer, graphql} from 'react-relay'

import SelectDevelopmentEnvironment from './../../wizard/SelectDevelopmentEnvironment'
let devEnvironments;
class DevEnvironments extends Component {
  constructor(props){
  	super(props);
  	this.state = {'modal_visible': false};

    devEnvironments = this;
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

  _setComponent(comp){

    devEnvironments._hideModal();
  }

  render(){

    let devEnvs = this.props.environment.devEnvs;
    let blockClass = this.props.blockClass;
    if (devEnvs) {
      return(
        <div className={ blockClass + '__development-environment'}>
          <div id='modal__cover' className={!this.state.modal_visible ? 'Environment__modal hidden' : 'Environment__modal'}>
            <div
              className="Environment__modal-close"
              onClick={() => this._hideModal()}>
              X
            </div>
            <SelectDevelopmentEnvironment
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

            <h4 className={blockClass + '__header'}>Development Environments</h4>
            <div className={blockClass + '__info flex justify--left flex--wrap'}>
            {
              devEnvs.edges.map((edge, index) => {
              return(
                <div key={this.props.labbookName + index} className={blockClass + '__development-environment-item'}>
                  {
                      (this.props.editVisible) &&
                      <p>{edge.node.info.description}</p>
                  }
                  <div className={blockClass + '__card flex justify--space-around'}>
                    <div className="flex-1-0-auto flex flex--wrap flex--column justify-center">
                      <img height="50" width="50" src={edge.node.info.icon} alt={edge.node.info.humanName} />
                    </div>
                    <div className={blockClass + '__card-text flex-1-0-auto'}>
                      <p>{edge.node.info.name}</p>
                      <p>{edge.node.info.humanName}</p>
                    </div>
                  </div>
                </div>
              )
              })

            }
            {
                (this.props.editVisible) &&
                <div className="Environment__edit-container">
                    <button onClick={()=> this._openModal()} className="Environment__edit-button">Edit</button>
                </div>
            }
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
  DevEnvironments,
  {
    environment: graphql`fragment DevEnvironments_environment on Environment @connection(key:"DevEnvironments_environment"){
    devEnvs(first: $first, after: $cursor){
      edges{
        cursor
        node{
          id
          component{
            id
            repository
            namespace
            name
            version
            componentClass
          }
          author{
            id
            name
            email
            username
            organization
          }
          info{
            id
            name
            humanName
            description
            versionMajor
            versionMinor
            tags
            icon
          }
          osBaseClass
          developmentEnvironmentClass
          installCommands
          execCommands
          exposedTcpPorts
        }
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
   query DevEnvironmentsPaginationQuery($first: Int!, $cursor: String!){
     labbook{
       environment{
         ...DevEnvironments_environment
       }
     }

   }`
}
)

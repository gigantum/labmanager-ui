import React, { Component } from 'react'
import {createPaginationContainer, graphql} from 'react-relay'

class DevEnvironments extends Component {
  constructor(props){
  	super(props);
  	this.state = {'modal_visible': false};
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
  render(){

    let devEnvs = this.props.environment.devEnvs;
    if (devEnvs) {
      return(
        <div className="Environment__development-environment">

            <h4 className="Environment__header">Development Environments</h4>
            <div className="Environment__info flex justify--left">
            {
              devEnvs.edges.map((edge, index) => {
              return(
                <div key={this.props.labbook_name + index} className="Environment__development-environment-item">
                  <p>{edge.node.info.description}</p>
                  <div className="Environment__card flex justify--space-around">
                    <div className="flex-1-0-auto flex flex--column justify-center">
                      <img height="50" width="50" src={edge.node.info.icon} alt={edge.node.info.humanName} />
                    </div>
                    <div className="Environment__card-text flex-1-0-auto">
                      <p>{edge.node.info.name}</p>
                      <p>{edge.node.info.humanName}</p>
                    </div>
                  </div>
                </div>
              )
              })

            }
            <div className="Environment__edit-container">
                <button className="Environment__edit-button">Edit</button>
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
    name = props.labbook_name;
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

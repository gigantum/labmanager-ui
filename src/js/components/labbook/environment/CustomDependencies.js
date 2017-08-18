import React, { Component } from 'react'
import {createPaginationContainer, graphql} from 'react-relay'

class CustomDependencies extends Component {

  render(){

    let customDependencies = this.props.environment.customDependencies;
    if (customDependencies) {
      return(
        <div className="Environment__dependencies">
            <h4 className="Environment__header">Custom Dependencies</h4>
            <div className="Environment__info flex justify--left">
            {
              customDependencies.edges.map(edge => {
                return(
                  <div key={this.props.labbook_name + edge.id} className="Environment__dependencies">
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
  CustomDependencies,
  {
    environment: graphql`fragment CustomDependencies_environment on Environment @connection(key:"CustomDependencies_environment"){
      customDependencies(first: $first, after: $cursor){
        edges{
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
            docker
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
    query CustomDependenciesPaginationQuery($first: Int!, $cursor: String!){
     labbook{
       environment{
         ...CustomDependencies_environment
       }
     }
   }`
}
)

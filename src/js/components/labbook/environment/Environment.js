import React, { Component } from 'react'
import {createFragmentContainer, graphql} from 'react-relay'

import environment from '../../../createRelayEnvironment'


class Environment extends Component {
  constructor(props){
  	super(props);
  }

  render(){
    console.log(this.props)
    if(this.props.labbook){
    return(
        <div className="Environment">

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

export default createFragmentContainer(
  Environment,
  graphql`fragment Environment_labbook on Labbook {
    environment{
      id
      imageStatus
      containerStatus
      devEnvs(first: $first){
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
      packageManagerDependencies(first: $first){
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
      customDependencies(first: $first){
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
    }
  }`
)

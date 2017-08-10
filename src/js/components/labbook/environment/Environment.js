import React, { Component } from 'react'
import {createPaginationContainer, graphql} from 'react-relay'

import environment from '../../../createRelayEnvironment'


class Environment extends Component {
  constructor(props){
  	super(props);
  }

  render(){
    console.log(this.props)
    return(
        <div className="Environment">

        </div>
      )
  }
}

export default createPaginationContainer(
  Environment,
  {
    availableBaseImages: graphql`
      fragment Environment_availableBaseImages on BaseImageConnection @connection(key: "Environment_environment"){
          edges{
            node{
              id
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
              osClass
              osRelease
              server
              namespace
              tag
              availablePackageManagers
            }
            cursor
          }
          pageInfo{
            endCursor
            hasNextPage
            hasPreviousPage
            startCursor
          }
      }`
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
        return props.labbook && props.labbook.notes;
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
   query EnvironmentPaginationQuery($first: Int!, $cursor: String!){
     availableBaseImages(first: $first, after: $cursor){
       ...Environment_availableBaseImages
     }
   }`

  }
)

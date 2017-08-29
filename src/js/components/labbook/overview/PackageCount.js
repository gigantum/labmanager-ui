import React, { Component } from 'react'

import environment from './../../../createRelayEnvironment'
import {
  QueryRenderer,
  graphql
} from 'react-relay'


let packageQuery = graphql`query PackageCountQuery($name: String!, $owner: String!, $first: Int!){
  labbook(name: $name, owner: $owner){
    environment{
      packageManagerDependencies(first: $first){
        edges{
          node{
            packageManager
            packageName
          }
        }
      }
    }
  }
}
`

export default class PackageCount extends Component {

  render(){

    return(
    <QueryRenderer
      variables={{
        name: this.props.labbookName,
        owner: 'default',
        first: 1000
      }}
      query={packageQuery}
      environment={environment}
      render={({error, props}) =>{

        if(props){
          let packages = {}
          props.labbook.environment.packageManagerDependencies.edges.forEach((edge) => {
            if(packages[edge.node.packageManager]){

              packages[edge.node.packageManager]++
            }else{
              packages[edge.node.packageManager] = 1
            }
          })

          return(
            <div className="PackageCount">
                <h4 className={'Overview__header'}>Dependencies</h4>
                <ul className="flex flex--wrap">
                  {
                     Object.keys(packages).map(key => {

                       return (<li className="PackageCount__item">{packages[key] + ' ' + key + ' package(s)' }</li>)
                     })
                  }
                </ul>
            </div>
          )
        }else if(error){

          return(<div>{error.message}</div>)
        }else{
          return(<div>loading</div>)
        }
      }}

    />)
  }
}

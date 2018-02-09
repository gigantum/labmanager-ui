//vendor
import React, { Component } from 'react'
import {
  QueryRenderer,
  graphql
} from 'react-relay'
//components
import Loader from 'Components/shared/Loader'
//utilites
import environment from 'JS/createRelayEnvironment'
//store
import store from 'JS/redux/store'

let packageQuery = graphql`query PackageCountQuery($name: String!, $owner: String!, $first: Int!){
  labbook(name: $name, owner: $owner){
    environment{
      packageDependencies(first: $first){
        edges{
          node{
            id
            schema
            manager
            package
            version
            latestVersion
            fromBase
          }
        }
      }
      customDependencies(first: $first) @connection(key:"CustomDependencies_customDependencies"){
        edges{
          node{
            id
            schema
            repository
            componentId
            revision
            name
            description
            tags
            license
            osBaseClass
            url
            requiredPackageManagers
            dockerSnippet
          }
        }
      }
    }
  }
}
`

export default class PackageCount extends Component {

  render(){
    const {owner, labbookName} = store.getState().routes
    return(
    <QueryRenderer
      variables={{
        name: labbookName,
        owner: owner,
        first: 100
      }}
      query={packageQuery}
      environment={environment}
      render={({error, props}) =>{

        if(props){
          let packages = {}
          props.labbook.environment.packageDependencies.edges.forEach((edge) => {
            if(edge.node){
              if(packages[edge.node.manager]){

                packages[edge.node.manager]++
              }else{
                packages[edge.node.manager] = 1
              }
            }
          })

          return(
            <div className="PackageCount">
                <div className="PackageCount__dependencies">
                  <h6 className={'Overview__header'}>Packages</h6>
                  <ul className="flex flex--wrap">

                    { (Object.keys(packages).length > 0) && (

                       Object.keys(packages).map(key => {

                         return (<li key={this.props.labbookName + key} className="PackageCount__item">{packages[key] + ' ' + key + ' package(s)' }</li>)
                       }))
                    }

                    {
                      (Object.keys(packages).length === 0) && (() =>{ return (<li className="PackageCount__item" key={this.props.labbookName + 'none'}>{'0 pip and apt-get packages'}</li>)})()

                    }
                  </ul>
                </div>
                <div className="PackageCount__dependencies">
                  <h6 className={'Overview__header'}>Custom Dependencies</h6>
                  <ul className="flex flex--wrap">
                    <li className="PackageCount__item">{props.labbook.environment.customDependencies.edges.length +  ' custom package(s)' }</li>
                  </ul>
                </div>
            </div>
          )
        }else if(error){

          return(<div>{error.message}</div>)
        }else{
          return(
            <div className="PackageCount">
              <div className="PackageCount__dependencies">
                <h6 className={'Overview__header'}>Packages</h6>
                <div>
                  loading..
                </div>
              </div>
              <div className="PackageCount__dependencies">
                <h6 className={'Overview__header'}>Custom Dependencies</h6>
                <div>
                  loading..
                </div>
              </div>
            </div>)
        }
      }}

    />)
  }
}

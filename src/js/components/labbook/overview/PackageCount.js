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
      customDependencies(first: $first) @connection(key:"CustomDependencies_customDependencies"){
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
        owner: this.props.owner,
        first: 100
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
            <div className="PackageCount flex flex--wrap justify--left">
                <div className="PackageCount__dependencies">
                  <h4 className={'Overview__header'}>Dependencies</h4>
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
                  <h4 className={'Overview__header'}>Custom Dependencies</h4>
                  <ul className="flex flex--wrap">
                    <li className="PackageCount__item">{props.labbook.environment.customDependencies.edges.length +  ' custom package(s)' }</li>
                  </ul>
                </div>
            </div>
          )
        }else if(error){

          return(<div>{error.message}</div>)
        }else{
          return(<Loader />)
        }
      }}

    />)
  }
}

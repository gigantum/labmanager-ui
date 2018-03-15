//vendor
import React, { Component } from 'react'
import {
  QueryRenderer,
  graphql
} from 'react-relay'
import {Link} from 'react-router-dom';
//components
import Loader from 'Components/shared/Loader'
import FileCard from './FileCard'
import FileEmpty from './FileEmpty'
//utilites
import environment from 'JS/createRelayEnvironment'
//store
import store from 'JS/redux/store'

let filePreviewQuery = graphql`query FilePreviewQuery($name: String!, $owner: String!, $first: Int!){
  labbook(name: $name, owner: $owner){
    code{
      favorites(first: $first){
        edges{
          node{
            id
            owner
            name
            section
            key
            description
            isDir
          }
        }
      }
    }
    input{
      favorites(first: $first){
        edges{
          node{
            id
            owner
            name
            section
            key
            description
            isDir
          }
        }
      }
    }
    output{
      favorites(first: $first){
        edges{
          node{
            id
            owner
            name
            section
            key
            description
            isDir
          }
        }
      }
    }
  }
}
`

export default class FilePreview extends Component {

  render(){
    const {owner, labbookName} = store.getState().routes
    return(
    <QueryRenderer
      variables={{
        name: labbookName,
        owner: owner,
        first: 3
      }}
      query={filePreviewQuery}
      environment={environment}
      render={({error, props}) =>{

        if(props){

          return(
            <div className="FilePreview">
              <div className="FilePreview__section">
                <div className="FilePreview__title-container">
                  <h5>Code</h5>
                  <Link
                    to={{pathname: `../../../../labbooks/${owner}/${labbookName}/code`}}
                    replace
                  >
                    Code Details >
                  </Link>
                </div>
                <p>Favorite Code Files</p>
                <div className="FilePreview__list">
                  {
                    props.labbook.code.favorites && props.labbook.code.favorites.edges.length ?
                    props.labbook.code.favorites.edges.map(edge =>{
                      return <FileCard key={edge.node.id} edge={edge} />
                    }) :
                    <FileEmpty
                      icon="code"
                      mainText="This LabBook has No Code Favorites"
                      subText="View LabBook Code Details"
                    />
                  }
                </div>
              </div>
              <div className="FilePreview__section">
                <div className="FilePreview__title-container">
                  <h5>Input Data</h5>
                  <Link
                    to={{pathname: `../../../../labbooks/${owner}/${labbookName}/inputData`}}
                    replace
                  >
                    Input Data Details >
                  </Link>
                </div>
                <p>Favorite Input Files</p>
                <div className="FilePreview__list">
                  {
                    props.labbook.input.favorites &&
                    props.labbook.input.favorites.edges.length ? props.labbook.input.favorites.edges.map(edge =>{
                      return <FileCard key={edge.node.id} edge={edge} />
                    }) :
                    <FileEmpty
                      icon="inputData"
                      mainText="This LabBook has No Input Favorites"
                      subText="View LabBook Input Data Details"
                    />
                  }
                </div>
              </div>
              <div className="FilePreview__section">
                <div className="FilePreview__title-container">
                  <h5>Ouput Data</h5>
                  <Link
                    to={{pathname: `../../../../labbooks/${owner}/${labbookName}/outputData`}}
                    replace
                  >
                    Output Data Details >
                  </Link>
                </div>
                <p>Favorite Output Files</p>
                <div className="FilePreview__list">
                  {
                    props.labbook.output.favorites &&
                    props.labbook.output.favorites.edges.length ? props.labbook.output.favorites.edges.map(edge =>{
                      return <FileCard key={edge.node.id} edge={edge} />
                    }) :
                    <FileEmpty
                      icon="outputData"
                      mainText="This LabBook has No Output Favorites"
                      subText="View LabBook Output Data Details"
                    />
                  }
                </div>
              </div>
            </div>
          )
        }else if(error){

          return(<div>{error.message}</div>)
        }else{
          return(
            <div className="FilePreview">
            <div className="FilePreview__section">
              <div className="FilePreview__title-container">
                <h5>Code</h5>
                <Link
                  to={{pathname: `../../../../labbooks/${owner}/${labbookName}/code`}}
                  replace
                >
                  Code Details >
                </Link>
              </div>
              <p>Favorite Code Files</p>
              <div className="FilePreview__list loading">
                <FileCard />
                <FileCard />
                <FileCard />
              </div>
            </div>
            <div className="FilePreview__section">
              <div className="FilePreview__title-container">
                <h5>Input Data</h5>
                <Link
                  to={{pathname: `../../../../labbooks/${owner}/${labbookName}/inputData`}}
                  replace
                >
                  Input Data Details >
                </Link>
              </div>
              <p>Favorite Input Files</p>
              <div className="FilePreview__list loading">
                <FileCard />
                <FileCard />
                <FileCard />
              </div>
            </div>
            <div className="FilePreview__section">
              <div className="FilePreview__title-container">
                <h5>Ouput Data</h5>
                <Link
                  to={{pathname: `../../../../labbooks/${owner}/${labbookName}/outputData`}}
                  replace
                >
                  Output Data Details >
                </Link>
              </div>
              <p>Favorite Output Files</p>
              <div className="FilePreview__list loading">
                <FileCard />
                <FileCard />
                <FileCard />
              </div>
            </div>
          </div>
          )
        }
      }}

    />)
  }
}

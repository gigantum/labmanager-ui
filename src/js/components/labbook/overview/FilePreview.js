//vendor
import React, { Component } from 'react'
import {
  QueryRenderer,
  graphql
} from 'react-relay'
//components
import Loader from 'Components/shared/Loader'
import FileCard from './FileCard'
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
        first: 6
      }}
      query={filePreviewQuery}
      environment={environment}
      render={({error, props}) =>{
        
        if(props){

          return(
            <div className="FilePreview">
              <div className="FilePreview__section">
                <h5>Code</h5>
                <p>Recent Files</p>
                <div className="FilePreview__list">
                  {
                    props.labbook.code.favorites.edges.map(edge =>{
                      return <FileCard edge={edge} />
                    })
                  }
                </div>
              </div>
              <div className="FilePreview__section">
                <h5>Input Data</h5>
                <p>Recent Files</p>
                <div className="FilePreview__list">
                  {
                    props.labbook.input.favorites.edges.map(edge =>{
                      return <FileCard edge={edge} />
                    })
                  }
                </div>
              </div>
              <div className="FilePreview__section">
                <h5>Output Data</h5>
                <p>Recent Files</p>
                <div className="FilePreview__list">
                  {
                    props.labbook.output.favorites.edges.map(edge =>{
                      return <FileCard edge={edge} />
                    })
                  }
                </div>
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

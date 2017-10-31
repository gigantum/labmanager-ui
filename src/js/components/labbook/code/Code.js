// vendor
import React, { Component } from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
//Config
import Config from './CodeConfig'
//mutations

import FileBrowserWrapper from 'Components/labbook/fileBrowser/FileBrowserWrapper'


class Code extends Component {
  constructor(props){
  	super(props);
  }


  render(){
    console.log(this.props)

    if(this.props.labbook){
      return(

        <div className="Code">
          <div className="Code__header">
            <h5 className="Code__subtitle">Code Files</h5>
            <div className="Code__toolbar">
              <a className="Code__filter">Favorites</a>
              <a className="Code__filter">Most Used</a>
              <a className="Code__filter">Most Recent</a>
            </div>
          </div>
          <div className="Code__favorites">

          </div>
          <div className="Code__header">
            <h5 className="Code__subtitle">Code Browser</h5>
            <div className="Code__toolbar">
              <p className="Code__import-text">
                <a className="Code__import-file">Import File</a>
                or Drag and Drop File Below
              </p>

            </div>
          </div>
          <div className="Code__file-browser">

            <FileBrowserWrapper
              ref='codeBrowser'
              rootFolder={"code"}
              files={this.props.labbook.files}
              connection="Code_files"
              {...this.props}
            />
          </div>
        </div>
      )
    }else{
      return(<div>Loading</div>)
    }
  }
}

export default createFragmentContainer(
  Code,
  {
    labbook: graphql`
      fragment Code_labbook on Labbook{
        files(first: 100)@connection(key: "Code_files"){
          edges{
            node{
              id
              isDir
              modifiedAt
              key
              size
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
        favorites(first: 3)@connection(key: "Code_favorites"){
          edges{
            node{
              id
              isDir
              index
              key
              description
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
  }
)

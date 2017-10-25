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
        <FileBrowserWrapper
          ref='codeBrowser'
          rootFolder={"code"}
          files={this.props.labbook.files}
          {...this.props}
        />
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
        files(first: 20)@connection(key: "Code_files"){
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
      }`
  }
)

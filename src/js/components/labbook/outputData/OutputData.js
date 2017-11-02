// vendor
import React, { Component } from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
//Config
import Config from './OutputConfig'
import FileBrowserWrapper from 'Components/labbook/fileBrowser/FileBrowserWrapper'


class OutputData extends Component {
  constructor(props){
  	super(props);

    this.state = {
      'show': false,
      'message': '',
      'files': Config.files
    }


  }

  render(){

    return(
        <FileBrowserWrapper
          ref="outPutBrowser"
          files={this.props.labbook.files}
          rootFoler="output"
          connection="OutputData_files"
          {...this.props}
        />
      )
  }
}


export default createFragmentContainer(
  OutputData,
  {
    labbook: graphql`
      fragment OutputData_labbook on Labbook{
        files(first: 100, baseDir: "code")@connection(key: "OutputData_files"){
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

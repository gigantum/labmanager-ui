// vendor
import React, { Component } from 'react'
import {createPaginationContainer, graphql} from 'react-relay'
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

  componentDidMount() {
    console.log(this.props.relay)
  }



  render(){
    console.log(this.props)
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


export default createPaginationContainer(
  OutputData,
  {

    labbook: graphql`
      fragment OutputData_labbook on Labbook{
        outputFiles(after: $cursor, first: $first, baseDir: "output")@connection(key: "OutputData_outputFiles"){
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
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.labbook
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount,
      };
    },
    getVariables(props, {count, cursor}, fragmentVariables) {
      let baseDir = "output"

      return {
        first: count,
        cursor,
        baseDir
      };
    },
    query: graphql`
      query OutputDataPaginationQuery(
        $first: Int
        $cursor: String
      ) {
        labbook {
          # You could reference the fragment defined previously.
          ...OutputData_labbook
        }
      }
    `
  }
)

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
  },
  {
    variables: {
      baseDir: "output"
    },
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
        count,
        cursor,
        baseDir
      };
    },
    query: graphql`
      query OutputDataPaginationQuery(
        $first: Int!
        $cursor: String
        $baseDir: String
      ) {
        labbook {
          # You could reference the fragment defined previously.
          ...OutputData_labbook
        }
      }
    `
  }
)

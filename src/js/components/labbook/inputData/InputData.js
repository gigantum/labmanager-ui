// vendor
import React, { Component } from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
//Config
import Config from './InputConfig'
//mutations
import FileBrowserWrapper from 'Components/labbook/fileBrowser/FileBrowserWrapper'
class InputData extends Component {
  constructor(props){
  	super(props);

    this.state = {
      'show': false,
      'message': '',
      'files': Config.files
    }
  }

  render(){
    if(this.props.labbook){

      return(
        <FileBrowserWrapper
          ref='inputBrowser'
          rootFoler="input"
          files={this.props.labbook.files}
          connection="InputData_files"
          {...this.props}
        />
      )
    }else{
      return(<div>loading</div>)
    }
  }
}


export default createFragmentContainer(
  InputData,
  {
    labbook: graphql`
      fragment InputData_labbook on Labbook{
        files(first: 100, baseDir: "code")@connection(key: "InputData_files"){

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
      let baseDir = "input"

      return {
        count,
        cursor,
        baseDir
      };
    },
    query: graphql`
      query InputDataPaginationQuery(
        $first: Int!
        $cursor: String
        $baseDir: String
      ) {
        labbook {
          # You could reference the fragment defined previously.
          ...InputData_labbook
        }
      }
    `
  }
)

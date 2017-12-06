// vendor
import React, { Component } from 'react'
import {createPaginationContainer, graphql} from 'react-relay'
//mutations

import FileBrowserWrapper from 'Components/labbook/fileBrowser/FileBrowserWrapper'

let codeRootFolder = ''
let totalCount = 2

class CodeBrowser extends Component {
  constructor(props){
  	super(props);

    this.state = {
      rootFolder: ''
    }
    this.setRootFolder = this.setRootFolder.bind(this)
  }

  /*
    handle state and addd listeners when component mounts
  */
  componentDidMount() {
    this._loadMore() //routes query only loads 2, call loadMore
  }
  /*
    @param
    triggers relay pagination function loadMore
    increments by 10
    logs callback
  */

  _loadMore() {
    let self = this;
    this.props.relay.loadMore(
     50, // Fetch the next 50 feed items
     (response, error) => {
       if(error){
         console.error(error)
       }

       if(self.props.code.allFiles &&
         self.props.code.allFiles.pageInfo.hasNextPage) {

         self._loadMore()
       }
     }
   );
  }
  /*
    @param
    sets root folder by key
    loads more files
  */
  setRootFolder(key){
    this.setState({rootFolder: key})
    codeRootFolder = key.replace('code/', '')
  }

  render(){
  
    if(this.props.code && this.props.code.allFiles){

      let codeFiles = this.props.code.allFiles
      if(this.props.code.allFiles.edges.length === 0){
        codeFiles = {
          edges: [],
          pageInfo: this.props.code.allFiles.pageInfo
        }
      }
      return(
          <FileBrowserWrapper
            ref='codeBrowser'
            section="code"
            setRootFolder={this.setRootFolder}
            files={codeFiles}
            parentId={this.props.codeId}
            connection="CodeBrowser_allFiles"
            favoriteConnection="CodeFavorites_favorites"
            {...this.props}
          />
      )
    }else{
      return(<div>No Files Found</div>)
    }
  }
}

export default createPaginationContainer(
  CodeBrowser,
  {

    code: graphql`
      fragment CodeBrowser_code on LabbookSection{
        allFiles(after: $cursor, first: $first)@connection(key: "CodeBrowser_allFiles", filters: []){
          edges{
            node{
              id
              isDir
              isFavorite
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
      return props.code && props.code.allFiles
    },
    getFragmentVariables(prevVars, totalCount,) {

      return {
        ...prevVars,
        first: totalCount,
      };
    },
    getVariables(props, {count, cursor}, fragmentVariables) {
      const username = localStorage.getItem('username')
      totalCount += count
      return {
        first: totalCount,
        cursor: cursor,
        owner: username,
        name: props.labbookName
      };
    },
    query: graphql`
      query CodeBrowserPaginationQuery(
        $first: Int
        $cursor: String
        $owner: String!
        $name: String!
      ) {
        labbook(name: $name, owner: $owner){
           id
           description
           code{
             id
            # You could reference the fragment defined previously.
            ...CodeBrowser_code
            }
        }
      }
    `
  }

)

// vendor
import React, { Component } from 'react'
import {createPaginationContainer, graphql} from 'react-relay'
//Config
import FileBrowserWrapper from 'Components/labbook/fileBrowser/FileBrowserWrapper'
//store
import store from 'JS/redux/store'

let outputRootFolder = 'output'

class OutputDataBrowser extends Component {
  constructor(props){
  	super(props);
    const {owner, labbookName} = store.getState().routes
    this.state = {
      'show': false,
      'message': '',
      'files': [],
      owner,
      labbookName
    }

  }

  /*
    handle state and addd listeners when component mounts
  */
  componentDidMount() {
    if(this.props.output.allFiles &&
      this.props.output.allFiles.pageInfo.hasNextPage) {
        this._loadMore()
    }
  }

  /*
    @param
    triggers relay pagination function loadMore
    increments by 50
    logs callback
  */
  _loadMore() {
    let self = this;
    this.props.relay.loadMore(
     50, // Fetch the next 50 feed items
     (response, error) => {
       if(error){
         console.error(error)
         if(self.props.output.allFiles &&
           self.props.output.allFiles.pageInfo.hasNextPage) {

           self._loadMore()
         }
       }
     }
   );
  }

  setRootFolder(key){
    this.setState({rootFolder: key})
    outputRootFolder = key
    this._loadMore()
  }

  render(){

    if(this.props.output && this.props.output.allFiles){
      let outputFiles = this.props.output.allFiles
      if(this.props.output.allFiles.edges.length === 0){
        outputFiles = {
          edges: [],
          pageInfo: this.props.output.allFiles.pageInfo
        }
      }

      return(
        <FileBrowserWrapper
          ref="OutputBrowser"
          files={outputFiles}
          section="output"
          parentId={this.props.outputId}
          favoriteConnection="OutputFavorites_favorites"
          connection="OutputDataBrowser_allFiles"
          owner={this.props.owner}
          {...this.props}
        />
      )
    }else {
      return(<div>No Files Found</div>)
    }
  }
}


export default createPaginationContainer(
  OutputDataBrowser,
  {

    output: graphql`
      fragment OutputDataBrowser_output on LabbookSection{
        allFiles(after: $cursor, first: $first)@connection(key: "OutputDataBrowser_allFiles", filters:[]){
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
      return props.output && props.output.allFiles
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount,
      };
    },
    getVariables(props, {count, cursor}, fragmentVariables) {

      const {owner, labbookName} = store.getState().routes

      return {
        first: count,
        cursor,
        owner: owner,
        name: labbookName
      };
    },
    query: graphql`
      query OutputDataBrowserPaginationQuery(
        $first: Int
        $cursor: String
        $owner: String!
        $name: String!
      ) {
        labbook(name: $name, owner: $owner){
           id
           description
           output{
            # You could reference the fragment defined previously.
            ...OutputDataBrowser_output
          }
        }
      }
    `
  }
)

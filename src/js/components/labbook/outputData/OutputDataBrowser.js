// vendor
import React, { Component } from 'react'
import {createPaginationContainer, graphql} from 'react-relay'
//Config
import FileBrowserWrapper from 'Components/labbook/fileBrowser/FileBrowserWrapper'

let outputRootFolder = 'output'

class OutputDataBrowser extends Component {
  constructor(props){
  	super(props);

    this.state = {
      'show': false,
      'message': '',
      'files': []
    }
    this._handleScroll = this._handleScroll.bind(this)
    this.setRootFolder = this.setRootFolder.bind(this)
  }

  /*
    handle state and addd listeners when component mounts
  */
  componentDidMount() {



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
     10, // Fetch the next 10 feed items
     (response, error) => {
       if(error){
         console.error(error)
         if(self.props.code.allFiles &&
           self.props.code.allFiles.pageInfo.hasNextPage) {

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
          edges: [{
            node:{
              modified: new Date(),
              key: 'output/',
              isDir: true,
              size: 0,
              id: 'output_temp'
            }
          }],
          pageInfo: this.props.output.allFiles.pageInfo
        }
      }

      return(
        <FileBrowserWrapper
          ref="outPutBrowser"
          setRootFolder={this.setRootFolder}
          files={outputFiles}
          section="output"
          parentId={this.props.outputId}
          favoriteConnection="OutputFavorites_favorites"
          connection="OutputData_allFiles"
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
      const username = localStorage.getItem('username')

      return {
        first: count,
        cursor,
        owner: username,
        name: props.labbookName
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

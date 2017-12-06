// vendor
import React, { Component } from 'react'
import {createPaginationContainer, graphql} from 'react-relay'
//mutations
import FileBrowserWrapper from 'Components/labbook/fileBrowser/FileBrowserWrapper'


let inputRootFolder = ''

class InputDataBrowser extends Component {
  constructor(props){
  	super(props);

    this.state = {
      'show': false,
      'message': '',
      'files': []
    }

    this.setRootFolder = this.setRootFolder.bind(this)
  }

  /*
    handle state and addd listeners when component mounts
  */
  componentDidMount() {
    this._loadMore()
  }

  setRootFolder(key){
    this.setState({rootFolder: key})
    inputRootFolder = key
    this._loadMore()
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
       }

       if(self.props.input.allFiles &&
         self.props.input.allFiles.pageInfo.hasNextPage) {

         self._loadMore()
       }
     }
   );
  }

  render(){

    if(this.props.input && this.props.input.allFiles){
      let inputFiles = this.props.input.allFiles
      if(this.props.input.allFiles.edges.length === 0){
        inputFiles = {
          edges: [],
          pageInfo: this.props.input.allFiles.pageInfo
        }
      }

      return(
        <FileBrowserWrapper
          ref='inputBrowser'
          section="input"
          setRootFolder={this.setRootFolder}
          files={inputFiles}
          connection="InputDataBrowser_allFiles"
          parentId={this.props.inputId}
          favoriteConnection="InputFavorites_favorites"
          {...this.props}
        />
      )
    }else{
      return(<div>No Files Found</div>)
    }
  }
}


export default createPaginationContainer(
  InputDataBrowser,
  {

    input: graphql`
      fragment InputDataBrowser_input on LabbookSection{
        allFiles(after: $cursor, first: $first)@connection(key: "InputDataBrowser_allFiles", filters: []){
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
      return props.input && props.input.allFiles
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
      query InputDataBrowserPaginationQuery(
        $first: Int
        $cursor: String
        $owner: String!
        $name: String!
      ) {
        labbook(name: $name, owner: $owner){
          input{
            # You could reference the fragment defined previously.
            ...InputDataBrowser_input
          }
        }
      }
    `
  }
)

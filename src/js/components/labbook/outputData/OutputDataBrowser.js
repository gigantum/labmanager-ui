// vendor
import React, { Component } from 'react'
import {createPaginationContainer, graphql} from 'react-relay'
//Config
import FileBrowserWrapper from 'Components/labbook/fileBrowser/FileBrowserWrapper'
//store
import store from 'JS/redux/store'

class OutputDataBrowser extends Component {
  constructor(props){
  	super(props);
    const {owner, labbookName} = store.getState().routes
    this.state = {
      'show': false,
      'message': '',
      'files': [],
      'moreLoading': false,
      owner,
      labbookName
    }

  }

  /*
    loads more if branches are switched
  */
  componentDidUpdate(){
    if(!this.state.moreLoading && this.props.output.allFiles && this.props.output.allFiles.edges.length < 3 && this.props.output.allFiles.pageInfo.hasNextPage){
      this._loadMore();
    }
  }

  /*
    handle state and add listeners when component mounts
  */
  componentDidMount() {
    if(this.props.output.allFiles &&
      this.props.output.allFiles.pageInfo.hasNextPage) {
        this._loadMore()
    } else {
      this.setState({'moreLoading': false});
    }
  }

  /*
    @param
    triggers relay pagination function loadMore
    increments by 100
    logs callback
  */
  _loadMore() {
    this.setState({'moreLoading': true});
    let self = this;
    this.props.relay.loadMore(
     100, // Fetch the next 100 feed items
     (response, error) => {
       if(error){
         console.error(error)
       }

       if(self.props.output.allFiles &&
        self.props.output.allFiles.pageInfo.hasNextPage) {
          self._loadMore()
      } else {
        this.setState({'moreLoading': false})
      }
     }
   );
  }

  setRootFolder(key){
    this.setState({rootFolder: key})
    this._loadMore()
  }

  render(){

    this.props.loadStatus(this.state.moreLoading);
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
          selectedFiles={this.props.selectedFiles}
          clearSelectedFiles={this.props.clearSelectedFiles}
          parentId={this.props.outputId}
          favoriteConnection="OutputFavorites_favorites"
          connection="OutputDataBrowser_allFiles"
          owner={this.props.owner}
          isLocked={this.props.isLocked}
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

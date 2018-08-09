// vendor
import React, { Component } from 'react'
import {createPaginationContainer, graphql} from 'react-relay'
//mutations
import FileBrowserWrapper from 'Components/labbook/fileBrowser/FileBrowserWrapper'
//store
import store from 'JS/redux/store'

class CodeBrowser extends Component {
  constructor(props){
  	super(props);

    this.state = {
      rootFolder: '',
      moreLoading: false
    }

    this.setRootFolder = this.setRootFolder.bind(this)
    this._loadMore = this._loadMore.bind(this)
  }

  /*
    loads more if branches are switched
  */
  componentDidUpdate(){
    if(!this.state.moreLoading && this.props.code.allFiles && this.props.code.allFiles.edges.length < 3 && this.props.code.allFiles.pageInfo.hasNextPage){
      this._loadMore();
    }
  }

  /*
    handle state and addd listeners when component mounts
  */
  componentDidMount() {
    if(this.props.code.allFiles &&
      this.props.code.allFiles.pageInfo.hasNextPage) {
        this._loadMore() //routes query only loads 2, call loadMore
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

       if(self.props.code.allFiles &&
         self.props.code.allFiles.pageInfo.hasNextPage) {
         self._loadMore()
       } else {
         this.setState({'moreLoading': false});
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
  }

  render(){

    this.props.loadStatus(this.state.moreLoading);
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
            selectedFiles={this.props.selectedFiles}
            clearSelectedFiles={this.props.clearSelectedFiles}
            setRootFolder={this.setRootFolder}
            files={codeFiles}
            parentId={this.props.codeId}
            connection="CodeBrowser_allFiles"
            favoriteConnection="CodeFavorites_favorites"
            favorites={this.props.favorites}
            isLocked={this.props.isLocked}
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
      const {owner, labbookName} = store.getState().routes

      return {
        first: count,
        cursor: cursor,
        owner: owner,
        name: labbookName
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

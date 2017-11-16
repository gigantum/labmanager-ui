// vendor
import React, { Component } from 'react'
import {createPaginationContainer, graphql} from 'react-relay'
//mutations

import FileBrowserWrapper from 'Components/labbook/fileBrowser/FileBrowserWrapper'

let codeRootFolder = ''

class CodeBrowser extends Component {
  constructor(props){
  	super(props);

    this.state = {
      rootFolder: ''
    }
    this._handleScroll = this._handleScroll.bind(this)
    this.setRootFolder = this.setRootFolder.bind(this)
  }

  /*
    handle state and addd listeners when component mounts
  */
  componentDidMount() {
    this._loadMore() //routes query only loads 2, call loadMore

    window.addEventListener('scroll', this._handleScroll);
  }

  /*
    handle state and remove listeners when component unmounts
  */
  componentWillUnmount() {

    window.removeEventListener('scroll', this._handleScroll);
  }

  /*
    @param {event} evt
  */
  _handleScroll(evt){

    let root = document.getElementById('root')

    let distanceY = window.innerHeight + document.documentElement.scrollTop + 40,

    expandOn = root.scrollHeight;

    if ((distanceY > expandOn) &&
      this.props.code.files &&
      this.props.code.files.pageInfo.hasNextPage) {

        this._loadMore(evt);
    }
  }

  /*
    @param
    triggers relay pagination function loadMore
    increments by 10
    logs callback
  */
  _loadMore() {

    this.props.relay.loadMore(
     10, // Fetch the next 10 feed items
     (response, error) => {
       if(error){
         console.error(error)
       }
     },
     {baseDir: this.state.rootFolder}
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
    this._loadMore()
  }

  render(){
    if(this.props.code && this.props.code.files){

      let codeFiles = this.props.code.files
      if(this.props.code.files.edges.length === 0){
        codeFiles = {
          edges: [{
            node:{
              modified: new Date(),
              key: 'code/',
              isDir: true,
              size: 0,
              id: 'code_temp'
            }
          }],
          pageInfo: this.props.code.files.pageInfo
        }
      }
      return(
          <FileBrowserWrapper
            ref='codeBrowser'
            rootFolder={this.state.rootFolder}
            setRootFolder={this.setRootFolder}
            files={codeFiles}
            parentId={this.props.codeId}
            connection="CodeBrowser_files"
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
        files(after: $cursor, first: $first, root: $root)@connection(key: "CodeBrowser_files", filters: []){
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
      return props.code && props.code.files
    },
    getFragmentVariables(prevVars, totalCount,) {

      return {
        ...prevVars,
        first: totalCount,
      };
    },
    getVariables(props, {count, cursor}, fragmentVariables) {
      const username = localStorage.getItem('username')

      let root = codeRootFolder

      return {
        first: count,
        cursor: (root !== '') ? null : cursor,
        root,
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
        $root: String
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

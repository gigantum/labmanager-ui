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
    this._loadMore()

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
      this.props.output.files &&
      this.props.output.files.pageInfo.hasNextPage) {

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
     }
   );
  }

  setRootFolder(key){
    this.setState({rootFolder: key})
    outputRootFolder = key
    this._loadMore()
  }

  render(){

    if(this.props.output && this.props.output.files){
      let outputFiles = this.props.output.files
      if(this.props.output.files.edges.length === 0){
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
          pageInfo: this.props.output.files.pageInfo
        }
      }

      return(
        <FileBrowserWrapper
          ref="outPutBrowser"
          setRootFolder={this.setRootFolder}
          files={outputFiles}
          rootFoler="output"
          parentId={this.props.outputId}
          favoriteConnection="OutputFavorites_favorites"
          connection="OutputData_files"
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
        files(after: $cursor, first: $first, root: $root)@connection(key: "OutputDataBrowser_files", filters:[]){
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
      return props.output && props.output.files
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount,
      };
    },
    getVariables(props, {count, cursor}, fragmentVariables) {
      let baseDir = outputRootFolder;
      const username = localStorage.getItem('username')

      return {
        first: count,
        cursor,
        baseDir,
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
        $root: String
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

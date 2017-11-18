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

    if ((distanceY > expandOn) && this.props.input &&
      this.props.input.files &&
      this.props.input.files.pageInfo.hasNextPage) {

        this._loadMore(evt);

    }
  }

  setRootFolder(key){
    this.setState({rootFolder: key})
    inputRootFolder = key
    this._loadMore()
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

  render(){

    if(this.props.input && this.props.input.files){
      let inputFiles = this.props.input.files
      if(this.props.input.files.edges.length === 0){
        inputFiles = {
          edges: [{
            node:{
              modified: new Date(),
              key: 'input/',
              isDir: true,
              size: 0,
              id: 'input_temp'
            }
          }],
          pageInfo: this.props.input.files.pageInfo
        }
      }

      return(
        <FileBrowserWrapper
          ref='inputBrowser'
          rootFoler="input"
          setRootFolder={this.setRootFolder}
          files={inputFiles}
          connection="InputData_files"
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
        files(after: $cursor, first: $first, root: $root)@connection(key: "InputDataBrowser_files", filters: []){
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
      return props.input && props.input.files
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount,
      };
    },
    getVariables(props, {count, cursor}, fragmentVariables) {
      let root = ''
      const username = localStorage.getItem('username')

      return {
        first: count,
        cursor,
        root,
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
        $root: String
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

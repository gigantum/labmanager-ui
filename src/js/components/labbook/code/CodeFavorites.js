// vendor
import React, { Component } from 'react'
import {createPaginationContainer, graphql} from 'react-relay'
//mutations

import FileBrowserWrapper from 'Components/labbook/fileBrowser/FileBrowserWrapper'

let counter = 10;
class Code extends Component {
  constructor(props){
  	super(props);
    this._handleScroll = this._handleScroll.bind(this)
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
    console.log(this.props.labbook.codeFiles.pageInfo)
    if ((distanceY > expandOn) &&
      this.props.labbook.codeFiles &&
      this.props.labbook.codeFiles.pageInfo.hasNextPage) {

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
     (r, e) => {
       console.log(r,e)
     }
   );
  }


  render(){
    console.log(this.props.labbook)
    if(this.props.labbook && this.props.labbook.favorites){
      return(
        <div>
          
        </div>
      )
    }else{
      return(<div>No Files Found</div>)
    }
  }
}

export default createPaginationContainer(
  Code,
  {

    labbook: graphql`
      fragment CodeFavorites_labbook on Labbook{
        favorites(after: $cursor, first: $first, subDir: "code")@connection(key: "CodeFavorites_favorites", filters: []){
          edges{
            node{
              id
              isDir
              description
              key
              index
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
      return props.labbook && props.labbook.codeFiles
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        first: totalCount,
      };
    },
    getVariables(props, {count, cursor}, fragmentVariables) {
      const username = localStorage.getItem('username')
      let baseDir = "code"
      console.log(props.labbookName)
      return {
        first: count,
        cursor,
        baseDir,
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
          # You could reference the fragment defined previously.
          ...CodeBrowser_labbook

        }
      }
    `
  }

)

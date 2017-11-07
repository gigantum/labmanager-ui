// vendor
import React, { Component } from 'react'
import {createPaginationContainer, graphql} from 'react-relay'
//Config
import Config from './CodeConfig'
//mutations

import FileBrowserWrapper from 'Components/labbook/fileBrowser/FileBrowserWrapper'

let counter = 10;
class Code extends Component {
  constructor(props){
  	super(props);
  }

  componentDidMount() {
    let self = this;
    this._loadMore()

    window.addEventListener('scroll', function(e){
      let root = document.getElementById('root')
      let distanceY = window.innerHeight + document.documentElement.scrollTop + 40,
      expandOn = root.scrollHeight;

      if ((distanceY > expandOn) && self.props.labbook.codeFiles.pageInfo.hasNextPage) {
          self._loadMore(e);
      }
    });
  }


  _loadMore() {

    this.props.relay.loadMore(
     10, // Fetch the next 10 feed items
     (r, e) => {
       console.log(r,e)
     }
   );
  }


  render(){
    let codeFiles = this.props.labbook.codeFiles
    if(this.props.labbook.codeFiles.edges.length === 0){
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
        pageInfo: this.props.labbook.codeFiles.pageInfo
      }
    }
    if(this.props.labbook){
      return(

        <div className="Code">
          <div className="Code__header">
            <h5 className="Code__subtitle">Code Files</h5>
            <div className="Code__toolbar">
              <a className="Code__filter">Favorites</a>
              <a className="Code__filter">Most Used</a>
              <a className="Code__filter">Most Recent</a>
            </div>
          </div>
          <div className="Code__favorites">

          </div>
          <div className="Code__header">
            <h5 className="Code__subtitle">Code Browser</h5>
            <div className="Code__toolbar">
              <p className="Code__import-text">
                <a className="Code__import-file">Import File</a>
                or Drag and Drop File Below
              </p>

            </div>
          </div>
          <div className="Code__file-browser">

            <FileBrowserWrapper
              ref='codeBrowser'
              rootFolder={"code"}
              files={codeFiles}
              connection="Code_codeFiles"
              {...this.props}
            />
          </div>
        </div>
      )
    }else{
      return(<div>Loading</div>)
    }
  }
}

export default createPaginationContainer(
  Code,
  {

    labbook: graphql`
      fragment Code_labbook on Labbook{
        codeFiles(after: $cursor, first: $first, baseDir: "code")@connection(key: "Code_codeFiles", filters: []){
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

      return {
        first: count,
        cursor,
        baseDir,
        owner: username,
        name: props.labbookName
      };
    },
    query: graphql`
      query CodePaginationQuery(
        $first: Int
        $cursor: String
        $owner: String!
        $name: String!
      ) {
        labbook(name: $name, owner: $owner){
           id
           description
          # You could reference the fragment defined previously.
          ...Code_labbook

        }
      }
    `
  }

)

// vendor
import React, { Component } from 'react'
import {createPaginationContainer, graphql} from 'react-relay'
//Config
import Config from './OutputConfig'
import FileBrowserWrapper from 'Components/labbook/fileBrowser/FileBrowserWrapper'


class OutputData extends Component {
  constructor(props){
  	super(props);

    this.state = {
      'show': false,
      'message': '',
      'files': Config.files
    }

  }

  componentDidMount() {
    let self = this;
    this._loadMore()

    window.addEventListener('scroll', function(e){
      let root = document.getElementById('root')
      let distanceY = window.innerHeight + document.documentElement.scrollTop + 40,
      expandOn = root.scrollHeight;

      if ((distanceY > expandOn) && self.props.labbook.outputFiles.pageInfo.hasNextPage) {
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

    let outputFiles = this.props.labbook.outputFiles
    if(this.props.labbook.outputFiles.edges.length === 0){
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
        pageInfo: this.props.labbook.outputFiles.pageInfo
      }
    }

    return(
        <div className="Code">
          <div className="Code__header">
            <h5 className="Code__subtitle">Output Browser</h5>
            <div className="Code__toolbar">
              <p className="Code__import-text">
                <a className="Code__import-file">Import File</a>
                or Drag and Drop File Below
              </p>

            </div>
          </div>
          <div className="Code__file-browser">
            <FileBrowserWrapper
              ref="outPutBrowser"
              files={outputFiles}
              rootFoler="output"
              connection="OutputData_outputFiles"
              {...this.props}
            />
        </div>
      </div>)
  }
}


export default createPaginationContainer(
  OutputData,
  {

    labbook: graphql`
      fragment OutputData_labbook on Labbook{
        outputFiles(after: $cursor, first: $first, baseDir: "output")@connection(key: "OutputData_outputFiles", filters:[]){
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
      return props.labbook && props.labbook.outputFiles
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount,
      };
    },
    getVariables(props, {count, cursor}, fragmentVariables) {
      let baseDir = "output"
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
      query OutputDataPaginationQuery(
        $first: Int
        $cursor: String
        $owner: String!
        $name: String!
      ) {
        labbook(name: $name, owner: $owner){
           id
           description
          # You could reference the fragment defined previously.
          ...OutputData_labbook
        }
      }
    `
  }
)

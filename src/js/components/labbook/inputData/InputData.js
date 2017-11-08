// vendor
import React, { Component } from 'react'
import {createPaginationContainer, graphql} from 'react-relay'
//mutations
import FileBrowserWrapper from 'Components/labbook/fileBrowser/FileBrowserWrapper'
class InputData extends Component {
  constructor(props){
  	super(props);

    this.state = {
      'show': false,
      'message': '',
      'files': []
    }

    this._handleScroll = this._handleScroll.bind(this)
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
      this.props.labbook.inputFiles &&
      this.props.labbook.inputFiles.pageInfo.hasNextPage) {

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

    if(this.props.labbook && this.props.labbook.inputFiles){
      let inputFiles = this.props.labbook.inputFiles
      if(this.props.labbook.inputFiles.edges.length === 0){
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
          pageInfo: this.props.labbook.inputFiles.pageInfo
        }
      }
      return(
      <div className="Code">
        <div className="Code__header">
          <h5 className="Code__subtitle">Input Browser</h5>
          <div className="Code__toolbar">
            <p className="Code__import-text">
              <a className="Code__import-file">Import File</a>
              or Drag and Drop File Below
            </p>

          </div>
        </div>
        <div className="Code__file-browser">
          <FileBrowserWrapper
            ref='inputBrowser'
            rootFoler="input"
            files={inputFiles}
            connection="InputData_inputFiles"
            {...this.props}
          />
        </div>
      </div>
      )
    }else{
      return(<div>No Files Found</div>)
    }
  }
}


export default createPaginationContainer(
  InputData,
  {

    labbook: graphql`
      fragment InputData_labbook on Labbook{
        inputFiles(after: $cursor, first: $first, baseDir: "input")@connection(key: "InputData_inputFiles", filters: []){
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
      return props.labbook && props.labbook.inputFiles
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount,
      };
    },
    getVariables(props, {count, cursor}, fragmentVariables) {
      let baseDir = "input"
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
      query InputDataPaginationQuery(
        $first: Int
        $cursor: String
        $owner: String!
        $name: String!
      ) {
        labbook(name: $name, owner: $owner){
          # You could reference the fragment defined previously.
          ...InputData_labbook
        }
      }
    `
  }
)

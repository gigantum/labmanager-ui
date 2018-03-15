// vendor
import React, { Component } from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
//components
import CodeBrowser from './CodeBrowser'
import CodeFavorites from './CodeFavorites'
import Loader from 'Components/shared/Loader'


class Code extends Component {
  constructor(props){
  	super(props);
  	this.state = {selectedFiles: []};
    this._setSelectedFiles = this._setSelectedFiles.bind(this)
    this._clearSelectedFiles =  this._clearSelectedFiles.bind(this)
    this._loadStatus = this._loadStatus.bind(this)

  }
  _setSelectedFiles(evt){
    let files = [...evt.target.files]
    this.setState({'selectedFiles': files})
  }

  _clearSelectedFiles(){
    this.setState({'selectedFiles':[]})
  }

  _loadStatus(res) {
    if(res !== this.state.loadingStatus){
      this.setState({'loadingStatus': res});
    }
  }

  render(){

    if(this.props.labbook){
      return(

        <div className="Code">
          <div className="Code__header">
            <h5 className="Code__subtitle">Code Files</h5>
            <div className="Code__toolbar">
              <a className="Code__filter">Favorites</a>
              <a className="Code__filter">Most Recent</a>
            </div>
          </div>
          <div className="Code__favorites">
            <CodeFavorites
              codeId={this.props.labbook.code.id}
              code={this.props.labbook.code}
            />
          </div>
          <div className="Code__header">
            <h5 className="Code__subtitle">Code Browser</h5>
            {this.state.loadingStatus &&
              <div className="Code__loading"></div>
            }
            <div className="Code__toolbar">
              <p className="Code__import-text" id="Code__">
                <label
                  className="Code__import-file"
                  htmlFor="file__code">
                  Upload File
                </label>
                <input
                  id="file__code"
                  className="hidden"
                  type="file"
                  onChange={(evt)=>{this._setSelectedFiles(evt)}}
                />
                or Drag and Drop File Below
              </p>
            </div>
          </div>
          <div className="Code__file-browser">
            <CodeBrowser
              selectedFiles={this.state.selectedFiles}
              clearSelectedFiles={this._clearSelectedFiles}
              labbookId={this.props.labbookId}
              codeId={this.props.labbook.code.id}
              code={this.props.labbook.code}
              loadStatus={this._loadStatus}
            />
          </div>
        </div>
      )
    }else{
      return(

        <div className="Code">
          <div className="Code__header">
            <h5 className="Code__subtitle">Code Files</h5>
            <div className="Code__toolbar">
              <a className="Code__filter">Favorites</a>
              <a className="Code__filter">Most Recent</a>
            </div>
          </div>
          <div className="Code__favorites loading">
            <CodeFavorites />
          </div>
          <div className="Code__header">
            <h5 className="Code__subtitle">Code Browser</h5>
            <div className="Code__toolbar loading">
              <p className="Code__import-text" id="Code__">
                <label
                  className="Code__import-file"
                  htmlFor="file__code">
                  Upload File
                </label>
                <input
                  id="file__code"
                  className="hidden"
                  type="file"
                  onChange={(evt)=>{this._setSelectedFiles(evt)}}
                />
                or Drag and Drop File Below
              </p>
            </div>
          </div>
          <div className="Code__file-browser loading">
            <CodeBrowser />
          </div>
        </div>
      )
    }
  }
}



export default createFragmentContainer(
  Code,
  graphql`
    fragment Code_labbook on Labbook{
      code{
        id
        ...CodeBrowser_code
        ...CodeFavorites_code
      }
    }
  `,
);

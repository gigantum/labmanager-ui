// vendor
import React, { Component } from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
//components
import OutputDataBrowser from './OutputDataBrowser'
import OutputFavorites from './OutputFavorites'

class OutputData extends Component {
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
    if(res !== this.state.loadingStatus) {
      this.setState({'loadingStatus': res});
    }
  }

  render(){

    if(this.props.labbook){

      return(

        <div className="Code">
          {
            this.props.labbook.output.isUntracked &&
            <div className="Code__tracked-container">
              <div className="Code__tracked">
                Version Tracking Disabled
              </div>
            </div>
          }
          <div className="Code__header">
            <h5 className="Code__subtitle">Output Files</h5>
            <div className="Code__toolbar">
              <a className="Code__filter">Favorites</a>
              <a className="Code__filter">Most Recent</a>
            </div>
          </div>
          <div className="Code__favorites">
            <OutputFavorites
              outputId={this.props.labbook.output.id}
              labbookId={this.props.labbookId}
              output={this.props.labbook.output}
            />
          </div>
          <div className="Code__header">
            <h5 className="Code__subtitle">Output Browser</h5>
            {this.state.loadingStatus &&
              <div className="Code__loading"></div>
            }
            <div className="Code__toolbar">
              <p className="Code__import-text" id="Code__">
                <label
                  className="Code__import-file"
                  htmlFor="file__output">
                  Upload File
                </label>
                <input
                  id="file__output"
                  className="hidden"
                  type="file"
                  onChange={(evt)=>{this._setSelectedFiles(evt)}}
                />
                or Drag and Drop File Below
              </p>
            </div>
          </div>
          <div className="Code__file-browser">
            <OutputDataBrowser
              selectedFiles={this.state.selectedFiles}
              clearSelectedFiles={this._clearSelectedFiles}
              outputId={this.props.labbook.output.id}
              labbookId={this.props.labbookId}
              output={this.props.labbook.output}
              loadStatus={this._loadStatus}
            />
          </div>
        </div>
      )
    }else{
      return(<div>No Files Found</div>)
    }
  }
}



export default createFragmentContainer(
  OutputData,
  graphql`
    fragment OutputData_labbook on Labbook {
      output{
        id
        ...OutputDataBrowser_output
        ...OutputFavorites_output
        isUntracked
      }
    }
  `,
);

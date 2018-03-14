// vendor
import React, { Component } from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
//components
import InputDataBrowser from './InputDataBrowser'
import InputFavorites from './InputFavorites'
//store
import store from 'JS/redux/store'

class InputData extends Component {
  constructor(props){
  	super(props);
    const {owner, labbookName} = store.getState().routes

    this.state = {
      owner,
      labbookName,
      selectedFiles: []
    }

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
            this.props.labbook.input.isUntracked &&
            <div className="Code__tracked-container">
              <div className="Code__tracked">
                Version Tracking Disabled
              </div>
            </div>
          }
          <div className="Code__header">
            <h5 className="Code__subtitle">Input Files</h5>
            <div className="Code__toolbar">
              <a className="Code__filter">Favorites</a>
              <a className="Code__filter">Most Recent</a>
            </div>
          </div>
          <div className="Code__favorites">
            <InputFavorites
              inputId={this.props.labbook.input.id}
              labbookId={this.props.labbookId}
              input={this.props.labbook.input}
            />
          </div>
          <div className="Code__header">
            <h5 className="Code__subtitle">Input Browser</h5>
            {this.state.loadingStatus &&
              <div className="Code__loading"></div>
            }
            <div className="Code__toolbar">
              <p className="Code__import-text" id="Code__">
                <label
                  className="Code__import-file"
                  htmlFor="file__input">
                  Upload File
                </label>
                <input
                  id="file__input"
                  className="hidden"
                  type="file"
                  onChange={(evt)=>{this._setSelectedFiles(evt)}}
                />
                or Drag and Drop File Below
              </p>
            </div>
          </div>
          <div className="Code__file-browser">
            <InputDataBrowser
              selectedFiles={this.state.selectedFiles}
              clearSelectedFiles={this._clearSelectedFiles}
              inputId={this.props.labbook.input.id}
              labbookId={this.props.labbookId}
              input={this.props.labbook.input}
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
  InputData,
  graphql`
    fragment InputData_labbook on Labbook {
      input{
        id
        ...InputDataBrowser_input
        ...InputFavorites_input
        isUntracked
      }
    }
  `,
);

// vendor
import React, { Component } from 'react'
import SweetAlert from 'sweetalert-react'
import FileBrowser from 'JS/vendor/FileBrowser/src/browser'
import Moment from 'moment'
//Config
import Config from './InputConfig'
//mutations
import StartContainerMutation from 'Mutations/StartContainerMutation'

export default class InputData extends Component {
  constructor(props){
  	super(props);

    this.state = {
      'show': false,
      'message': '',
      'files': Config.files
    }

    this.handleCreateFolder = this.handleCreateFolder.bind(this);
    this.handleCreateFiles = this.handleCreateFiles.bind(this);
    this.handleRenameFolder = this.handleRenameFolder.bind(this);
    this.handleRenameFile = this.handleRenameFile.bind(this);
    this.handleDeleteFolder = this.handleDeleteFolder.bind(this);
    this.handleDeleteFile = this.handleDeleteFile.bind(this);

  }

  handleCreateFolder(key) {
    this.setState(state => {
      state.files = state.files.concat([{
        key: key,
      }]);
      return state;
    });
  }
  handleCreateFiles(files, prefix) {
    this.setState(state => {
      let newFiles = files.map((file) => {
        let newKey = prefix;
        if (prefix !== '' && prefix.substring(prefix.length - 1, prefix.length) !== '/') {
          newKey += '/';
        }
        newKey += file.name;
        return {
          key: newKey,
          size: file.size,
          modified: + Moment(),
        };
      });

      let uniqueNewFiles = [];
      newFiles.forEach((newFile) => {
        let exists = false;
        state.files.forEach((existingFile) => {
          if (existingFile.key === newFile.key) {
            exists = true;
          }
        });
        if (!exists) {
          uniqueNewFiles.push(newFile);
        }
      });
      state.files = state.files.concat(uniqueNewFiles);
      return state;
    });
  }
  handleRenameFolder(oldKey, newKey) {
    this.setState(state => {
      let newFiles = [];
      state.files.map((file) => {
        if (file.key.substr(0, oldKey.length) === oldKey) {
          newFiles.push({
            ...file,
            key: file.key.replace(oldKey, newKey),
            modified: +Moment(),
          });
        }
        else {
          newFiles.push(file);
        }
      });
      state.files = newFiles;
      return state;
    });
  }
  handleRenameFile(oldKey, newKey) {
    this.setState(state => {
      let newFiles = [];
      state.files.forEach((file) => {
        if (file.key === oldKey) {
          newFiles.push({
            ...file,
            key: newKey,
            modified: +Moment(),
          });
        }
        else {
          newFiles.push(file);
        }
      });
      state.files = newFiles;
      return state;
    });
  }
  handleDeleteFolder(folderKey) {
    this.setState(state => {
      let newFiles = [];
      state.files.forEach((file) => {
        if (file.key.substr(0, folderKey.length) !== folderKey) {
          newFiles.push(file);
        }
      });
      state.files = newFiles;
      return state;
    });
  }
  handleDeleteFile(fileKey) {
    this.setState(state => {
      let newFiles = [];
      state.files.forEach((file) => {
        if (file.key !== fileKey) {
          newFiles.push(file);
        }
      });
      state.files = newFiles;
      return state;
    });
  }

  render(){

    return(
        <div id="code" className="Code flex flex-row justify-center">
          {/* <button className="Code__open-jupyter" onClick={() => this._openJupyter()}
          target="_blank">
            Open Jupyter
          </button> */}
          <FileBrowser ref="FileBrowser"
            files={this.state.files}
            onCreateFolder={this.handleCreateFolder}
            onCreateFiles={this.handleCreateFiles}
            onMoveFolder={this.handleRenameFolder}
            onMoveFile={this.handleRenameFile}
            onRenameFolder={this.handleRenameFolder}
            onRenameFile={this.handleRenameFile}
            onDeleteFolder={this.handleDeleteFolder}
            onDeleteFile={this.handleDeleteFile}
          />

          <SweetAlert
            className="sa-error-container"
            show={this.state.show}
            type="error"
            title="Error"
            text={this.state.message}
            onConfirm={() => {
              this.setState({ show: false, message: ''})
            }}
            />
        </div>
      )
  }
}

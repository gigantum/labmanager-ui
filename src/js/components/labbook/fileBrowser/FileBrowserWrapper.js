// vendor
import React, { Component } from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import SweetAlert from 'sweetalert-react'
import FileBrowser from 'Submodules/react-keyed-file-browser/FileBrowser/src/browser'
import Moment from 'moment'

//mutations
import StartContainerMutation from 'Mutations/StartContainerMutation'
import DeleteLabbookFileMutation from 'Mutations/DeleteLabbookFileMutation'
import MakeLabbookDirectoryMutation from 'Mutations/MakeLabbookDirectoryMutation'
import MoveLabbookFileMutation from 'Mutations/MoveLabbookFileMutation'
import AddLabbookFileMutation from 'Mutations/AddLabbookFileMutation'

export default class FileBrowserWrapper extends Component {
  constructor(props){
  	super(props);

    this.state = {
      'show': false,
      'message': '',
      'files': this._formatFileJson(props.labbook.files)
    }

    this.handleCreateFolder = this.handleCreateFolder.bind(this)
    this.handleCreateFiles = this.handleCreateFiles.bind(this)
    this.handleRenameFolder = this.handleRenameFolder.bind(this)
    this.handleRenameFile = this.handleRenameFile.bind(this)
    this.handleDeleteFolder = this.handleDeleteFolder.bind(this)
    this.handleDeleteFile = this.handleDeleteFile.bind(this)
    this._openJupyter = this._openJupyter.bind(this)

  }
  /**
  *  @param {none}
  *  uses dom to show mask on file directory
  */
  showMask(){
    document.getElementById('filebrowser-mask').classList.remove('hidden')
  }
  /**
  *  @param {none}
  *  uses dom to hide mask on file directory
  */
  hideMask(){
    document.getElementById('filebrowser-mask').classList.add('hidden')
  }
  /**
  *  @param {string} key - file key
  *  creates a directory using MakeLabbookDirectoryMutation
  */
  handleCreateFolder(key) {
    let self = this;
    this.showMask()

    MakeLabbookDirectoryMutation(
      this.props.connection,
      localStorage.getItem('username'),
      localStorage.getItem('username'),
      this.props.labbookName,
      this.props.labbookId,
      key,
      (response) => {
        self.hideMask()

      }
    )
  }

  /**
  *  @param {string, string} key,prefix  file key, prefix is root folder -
  *  creates a file using AddLabbookFileMutation by passing a blob
  */
  handleCreateFiles(files, prefix) {
    this.showMask()
    this.setState(state => {
      let newFiles = files.map((file) => {
        let newKey = prefix;
        if (prefix !== '' && prefix.substring(prefix.length - 1, prefix.length) !== '/') {
          newKey += '/';
        }
        newKey += file.name;

        let fileReader = new FileReader();
        let that = this;

        fileReader.onloadend = function (evt) {
          let arrayBuffer = evt.target.result;
          let blob = new Blob([new Uint8Array(arrayBuffer)]);

          AddLabbookFileMutation(
            that.props.connection,
            localStorage.getItem('username'),
            localStorage.getItem('username'),
            that.props.labbookName,
            that.props.labbookId,
            newKey,
            blob,
            () =>{
              that.hideMask()

            }
          )
        };

        fileReader.readAsArrayBuffer(file);
          return {
            key: newKey,
            size: file.size,
            modified: + Moment(),
          };
        });
      })
  }
  /**
  *  @param {string, string} oldKey,newKey  file key, prefix is root folder -
  *  renames folder by creating new folder, moving files to the folder and deleting the old folder
  */

  handleRenameFolder(oldKey, newKey) {
    let self = this;
    this.showMask()
    let edgesToMove = this.props.files.edges.filter((edge) => {
      return edge && (edge.node.key.indexOf(oldKey) > -1)
    })

    let folderToMove = edgesToMove.filter((edge) => {
      return edge.node.key.indexOf('.') < 0
    })[0]

    MakeLabbookDirectoryMutation(
      this.props.connection,
      localStorage.getItem('username'),
      localStorage.getItem('username'),
      this.props.labbookName,
      this.props.labbookId,
      newKey,
      (response) => {

        let all = []

        edgesToMove.forEach((edge) => {
          if(edge.node.key.indexOf('.') > -1 ){
            all.push(new Promise((resolve, reject)=>{
              let newKeyComputed = edge.node.key.replace(oldKey, newKey)

                MoveLabbookFileMutation(
                  this.props.connection,
                  localStorage.getItem('username'),
                  localStorage.getItem('username'),
                  this.props.labbookName,
                  this.props.labbookId,
                  edge,
                  edge.node.key,
                  newKeyComputed,
                  (response) => {

                    if(response.moveLabbookFile){

                      setTimeout(function(){

                        resolve(response.moveLabbookFile)
                      },1050)
                    }else{
                        reject(response[0].message)
                    }
                  }
                )


            }))
          }

        })

        Promise.all(all).then(values =>{

          let edgeToDelete = this.props.files.edges.filter((edge) => {
            return edge && (oldKey === edge.node.key)
          })[0]

          DeleteLabbookFileMutation(
            this.props.connection,
            localStorage.getItem('username'),
            localStorage.getItem('username'),
            this.props.labbookName,
            this.props.labbookId,
            edgeToDelete.node.id,
            oldKey,
            (response) => {

              self.hideMask()
            }
          )
        }).catch(reason =>{
          console.log(reason[0].message)
        })
      }
    )

  }

  /**
  *  @param {string, string} oldKey,newKey
  *  moves file from old folder to a new folder
  */
  handleRenameFile(oldKey, newKey) {
    let that = this;
    this.showMask()
    let edgeToMove = this.props.files.edges.filter((edge) => {
      return edge && (oldKey === edge.node.key)
    })[0]

    if(edgeToMove){
      MoveLabbookFileMutation(
        this.props.connection,
        localStorage.getItem('username'),
        localStorage.getItem('username'),
        this.props.labbookName,
        this.props.labbookId,
        edgeToMove,
        oldKey,
        newKey,
        (response) => {

          that.hideMask()
        }
      )
    }
  }

  /**
  *  @param {string} folderKey
  *  deletes foler with a specified key
  */
  handleDeleteFolder(folderKey) {
    let self = this
    this.showMask()

    let edgeToDelete = this.props.files.edges.filter((edge) => {
      return edge && (folderKey === edge.node.key)
    })[0]

    DeleteLabbookFileMutation(
      this.props.connection,
      localStorage.getItem('username'),
      localStorage.getItem('username'),
      this.props.labbookName,
      this.props.labbookId,
      edgeToDelete.node.id,
      folderKey,
      (response) => {
        self.hideMask()
      }
    )
  }
  /**
  *  @param {string} fileKey
  *  deletes file with a specified key
  */
  handleDeleteFile(fileKey) {

    let self = this
    this.showMask()

    let edgeToDelete = this.props.files.edges.filter((edge) => {
      return edge && (fileKey === edge.node.key)
    })[0]

    DeleteLabbookFileMutation(
      this.props.connection,
      localStorage.getItem('username'),
      localStorage.getItem('username'),
      this.props.labbookName,
      this.props.labbookId,
      edgeToDelete.node.id,
      fileKey,
      (response) => {
        self.hideMask()
      }
    )
  }

  /**
  *  @param {}
  *  start contianer muations
  *  redirect user to jupyter in callback
  */
  _openJupyter(){
    let username = localStorage.getItem('username')
    StartContainerMutation(
      this.props.labbookName,
      username,
      'clientMutationId',
      (error) =>{
        if(error){
          this.setState({
            'show': true,
            'message': error[0].message,
          })
        }else{
          setTimeout(function(){
            window.open('http://localhost:8888/', '_blank')
          }, 3000)
        }
      }
    )
  }
  /**
  *  @param {object} files
  *  formats files for file browser
  *  @return {array}
  */
  _formatFileJson(files){

      let formatedArray = []

      files.edges.forEach((edge) => {
        if(edge){
          formatedArray.push({
            key: edge.node.key,
            modified: edge.node.modifiedAt,
            size: edge.node.size
          })
        }
      })

      return formatedArray
  }
  render(){

    let files = this._formatFileJson(this.props.files)

    return(
        <div id="code" className="Code flex flex-row justify-center">
          {/* <button className="Code__open-jupyter" onClick={() => this._openJupyter()}
          target="_blank">
            Open Jupyter
          </button> */}
          <FileBrowser
            ref={this.props.connection}
            key={this.props.connection}
            keyPrefix={this.props.connection}
            files={files}
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

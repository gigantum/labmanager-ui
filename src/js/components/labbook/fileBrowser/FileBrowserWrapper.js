// vendor
import React, { Component } from 'react'
import FileBrowser from 'Submodules/react-keyed-file-browser/FileBrowser/src/browser'
import classNames from 'classnames'
//components
import DetailPanel from './../detail/DetailPanel'
//mutations
import DeleteLabbookFileMutation from 'Mutations/fileBrowser/DeleteLabbookFileMutation'
import MakeLabbookDirectoryMutation from 'Mutations/fileBrowser/MakeLabbookDirectoryMutation'
import MoveLabbookFileMutation from 'Mutations/fileBrowser/MoveLabbookFileMutation'
import AddFavoriteMutation from 'Mutations/fileBrowser/AddFavoriteMutation'
import RemoveFavoriteMutation from 'Mutations/fileBrowser/RemoveFavoriteMutation'
//helpers
import FolderUpload from './folderUpload'
//Config
import config from 'JS/config'

//utilities
import ChunkUploader from 'JS/utils/ChunkUploader'
//store
import store from 'JS/redux/store'


/**
* @param {array} files
*
* @return {number} totalFiles
*/
const getTotalFileLength = (files) => {
  let fileCount = 0;
  let hasDirectoryUpload = false;

  function filesRecursionCount(file){

      if(Array.isArray(file)){
        file.forEach((nestedFile)=>{
          filesRecursionCount(nestedFile)
        })
      }else if( file.file && Array.isArray(file.file) && (file.file.length > 0)){
        file.file.forEach((nestedFile)=>{
          filesRecursionCount(nestedFile)
        })
      }else{

        let extension = file.name ? file.name.replace(/.*\./, '') : file.entry.fullPath.replace(/.*\./, '');

        if(file.entry.isDirectory){
          hasDirectoryUpload = true
        }
        if((config.fileBrowser.excludedFiles.indexOf(extension) < 0) && file.entry.isFile){
          fileCount++
        }
      }
  }


  filesRecursionCount(files)

  return {fileCount: fileCount, hasDirectoryUpload: hasDirectoryUpload}
}

export default class FileBrowserWrapper extends Component {
  constructor(props){
  	super(props);
    const {owner, labbookName} = store.getState().routes
    const {uploading} = store.getState().fileBrowser
    this.state = {
      'show': false,
      'selectedFile': null,
      'message': '',
      'files': this._formatFileJson(props.files),
      'labbookName': labbookName,
      'owner': owner,
      uploading
    }

    //bind functions here
    this.handleCreateFolder = this.handleCreateFolder.bind(this)
    this.handleCreateFiles = this.handleCreateFiles.bind(this)
    this.handleRenameFolder = this.handleRenameFolder.bind(this)
    this.handleRenameFile = this.handleRenameFile.bind(this)
    this.handleDeleteFolder = this.handleDeleteFolder.bind(this)
    this.handleDeleteFile = this.handleDeleteFile.bind(this)
    this.openDetailPanel = this.openDetailPanel.bind(this)
    this.handleFileFavoriting = this.handleFileFavoriting.bind(this)

  }

  componentDidMount() {
    this.unsubscribe = store.subscribe(() =>{
      this.setState({uploading: store.getState().fileBrowser.uploading})
    })
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  componentWillUpdate(nextProps, nextState) {
    if(nextProps.selectedFiles.length > 0){

      this.handleCreateFiles(nextProps.selectedFiles, '')

      this.props.clearSelectedFiles()
    }
  }
  /**
  *  @param {string} key - file key
  *  creates a directory using MakeLabbookDirectoryMutation
  */
  handleCreateFolder(key) {
    let self = this;

    MakeLabbookDirectoryMutation(
      this.props.connection,
      self.state.owner,
      this.state.labbookName,
      this.props.parentId,
      key,
      this.props.section,
      (response, error) => {

        if(error){
          console.error(error)

          store.dispatch({
            type: 'ERROR_MESSAGE',
            payload: {
              message: `ERROR: could not create ${key}`,
              messageBody: error
            }
          })
        }
      }
    )
  }

  /**
  *  @param {string, file, object, boolean, array, number} key,prefix  file key, prefix is root folder -
  *  creates a file using AddLabbookFileMutation by passing a blob
  */
  _chunkLoader(filepath, file, data, batchUpload, files, index, callback){


   ChunkUploader.chunkFile(data, callback)
 }



  /**
  *  @param {string, string} key,prefix  file key, prefix is root folder -
  *  creates a file using AddLabbookFileMutation by passing a blob
  */
  handleCreateFiles(files, prefix) {
    if (!this.state.uploading) {

    let fileMetaData =  getTotalFileLength(files),
    totalFiles = fileMetaData.fileCount,
    hasDirectoryUpload = fileMetaData.hasDirectoryUpload
    if(totalFiles > 0){

      store.dispatch({
        type: 'UPLOAD_MESSAGE_SETTER',
        payload:{
          uploadMessage: `Preparing Upload for ${totalFiles} files`,
          id: Math.random() * 10000,
          totalFiles: totalFiles
        }
      })
    }else if(hasDirectoryUpload && (totalFiles === 0)){
      store.dispatch({
        type: 'INFO_MESSAGE',
        payload:{
          message: `Uploading Directories`,
        }
      })
    }else{
      store.dispatch({
        type: 'INFO_MESSAGE',
        payload:{
          message: `Cannot upload these file types`,
        }
      })

      let self = this;

      let totalFiles = getTotalFileLength(files)
      if(totalFiles > 0){

        store.dispatch({
          type: 'UPLOAD_MESSAGE_SETTER',
          payload:{
            uploadMessage: `Preparing Upload for ${totalFiles} files`,
            id: Math.random() * 10000,
            totalFiles: totalFiles
          }
        })
      }else{
        store.dispatch({
          type: 'UPLOAD_MESSAGE_SETTER',
          payload:{
            uploadMessage: `Cannot upload these file types`,
            id: `nofiles`,
            totalFiles: totalFiles
          }
        })
      }

      let folderFiles = []
      files.forEach((file, index) => {
        if(file.isDirectory){
          folderFiles.push(file)
        }else if(file.name){
          const batchUpload = (files.length > 1)

          let newKey = prefix;

          if (prefix !== '' && prefix.substring(prefix.length - 1, prefix.length) !== '/') {
            newKey += '/';
          }

          newKey += file.name;


<<<<<<< HEAD
          let fileReader = new FileReader();
=======
            self._chunkLoader(filepath, file, data, batchUpload, files, index, (data)=>{

            })
          }
>>>>>>> added empty folder upload handling

          fileReader.onloadend = function (evt) {
              let filepath = newKey

              let data = {
                file: file,
                filepath: filepath,
                username: self.state.owner,
                accessToken: localStorage.getItem('access_token'),
                connectionKey: self.props.connection,
                labbookName: self.state.labbookName,
                parentId: self.props.parentId,
                section: self.props.section
              }

              self._chunkLoader(filepath, file, data, batchUpload, files, index)
            }

<<<<<<< HEAD
            fileReader.readAsArrayBuffer(file);
        }else{
          folderFiles.push(file)
        }

      })
      let flattenedFiles = []
=======
    })
    let flattenedFiles = []

    if(folderFiles.length > 0){
>>>>>>> fixed file upload and status messsages associated with file upload

      if(folderFiles.length > 0){

<<<<<<< HEAD
        function flattenFiles(filesArray){

            if(Array.isArray(filesArray)){
              filesArray.forEach(filesSubArray => {
                flattenFiles(filesSubArray)
              })
            }else if(filesArray.entry){
              flattenedFiles.push(filesArray)
            }
        }
=======
          if(Array.isArray(filesArray)){
            filesArray.forEach(filesSubArray => {
              flattenFiles(filesSubArray)
            })
          }else if(Array.isArray(filesArray.file) && (filesArray.file.length > 0)){
            flattenFiles(filesArray.file)
          }
          else if(filesArray.entry){
            flattenedFiles.push(filesArray)
          }
      }
>>>>>>> fixed file upload and status messsages associated with file upload

        flattenFiles(folderFiles)

<<<<<<< HEAD
        let filterFiles = flattenedFiles.filter((fileItem) => {
          let extension = fileItem.name ? fileItem.name.replace(/.*\./, '') : fileItem.file.name.replace(/.*\./, '');
=======
      let filterFiles = flattenedFiles.filter((fileItem) => {
        let extension = fileItem.name ? fileItem.name.replace(/.*\./, '') : fileItem.entry.fullPath.replace(/.*\./, '');
>>>>>>> fixed file upload and status messsages associated with file upload

          return (config.fileBrowser.excludedFiles.indexOf(extension) < 0)
        })

        FolderUpload.uploadFiles(
          filterFiles,
          prefix,
          self.state.labbookName,
          self.state.owner,
          self.props.section,
          this.props.connection,
          this.props.parentId,
          self._chunkLoader
        )

      }
    }
  }
  /**
  *  @param {string, string} oldKey,newKey  file key, prefix is root folder -
  *  renames folder by creating new folder, moving files to the folder and deleting the old folder
  */

  handleRenameFolder(oldKey, newKey) {
    let self = this;
    let edgesToMove = this.props.files.edges.filter((edge) => {
      return edge && (edge.node.key.indexOf(oldKey) > -1)
    })

    MakeLabbookDirectoryMutation(
      this.props.connection,
      self.state.owner,
      this.state.labbookName,
      this.props.parentId,
      newKey,
      this.props.section,
      (response, error) => {
        if(error){
          store.dispatch({
            type: 'ERROR_MESSAGE',
            payload: {
              message: `ERROR: could not make ${newKey}`,
              messageBody: error
            }
          })
        }
        let all = []

        edgesToMove.forEach((edge) => {
          if(edge.node.key.indexOf('.') > -1 ){
            all.push(new Promise((resolve, reject)=>{
                let newKeyComputed = edge.node.key.replace(oldKey, newKey)

                MoveLabbookFileMutation(
                  this.props.connection,
                  self.state.owner,
                  this.state.labbookName,
                  this.props.parentId,
                  edge,
                  edge.node.key,
                  newKeyComputed,
                  this.props.section,
                  (response, error) => {

                    if(response.moveLabbookFile){

                      setTimeout(function(){

                        resolve(response.moveLabbookFile)
                      },1050)
                    }else{
                        store.dispatch({
                          type: 'ERROR_MESSAGE',
                          payload: {
                            message: `ERROR: could not move ${edge.node.key}`,
                            messageBody: error
                          }
                        })
                        reject(response)
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

          let edgesToDelete = this.props.files.edges.filter((edge) => {
            return edge && (edge.node.key.indexOf(oldKey) > -1)
          })[0]

          DeleteLabbookFileMutation(
            this.props.connection,
            self.state.owner,
            this.state.labbookName,
            this.props.parentId,
            edgeToDelete.node.id,
            oldKey,
            this.props.section,
            edgesToDelete,
            (response, error) => {
              if(error){
                console.error(error)
                store.dispatch({
                  type: 'ERROR_MESSAGE',
                  payload: {
                    message: `ERROR: could node delete file ${oldKey}`,
                    messageBody: error
                  }
                })
              }
            }
          )
        }).catch(error =>{
          console.error(error)
        })
      }
    )

  }

  /**
  *  @param {string, string} oldKey,newKey
  *  moves file from old folder to a new folder
  */
  handleRenameFile(oldKey, newKey) {
    let edgeToMove = this.props.files.edges.filter((edge) => {
      return edge && edge.node && (oldKey === edge.node.key)
    })[0]

    if(edgeToMove){
      MoveLabbookFileMutation(
        this.props.connection,
        this.state.owner,
        this.state.labbookName,
        this.props.parentId,
        edgeToMove,
        oldKey,
        newKey,
        this.props.section,
        (moveResponse, error) => {

          if(error){
            console.error(error)
            store.dispatch({
              type: 'ERROR_MESSAGE',
              payload: {
                message: `ERROR: could not move file ${oldKey}`,
                messageBody: error
              }
            })
          }else{

            if(edgeToMove.node.isFavorite){

              RemoveFavoriteMutation(
                this.props.favoriteConnection,
                this.props.parentId,
                this.state.owner,
                this.state.labbookName,
                this.props.section,
                oldKey,
                edgeToMove.node.id,
                edgeToMove,
                this.props.favorites,
                (response, error)=>{

                  if(error){
                    console.error(error)
                    store.dispatch({
                      type: 'ERROR_MESSAGE',
                      payload: {
                        message: `ERROR: could not remove favorite ${oldKey}`,
                        messageBody: error
                      }
                    })
                  }else{

                    AddFavoriteMutation(
                      this.props.favoriteConnection,
                      this.props.connection,
                      this.props.parentId,
                      this.state.owner,
                      this.state.labbookName,
                      newKey,
                      '',
                      false,
                      moveResponse.moveLabbookFile.newLabbookFileEdge,
                      this.props.section,
                      (response, error)=>{
                        if(error){
                          console.error(error)
                          store.dispatch({
                            type: 'ERROR_MESSAGE',
                            payload: {
                              message: `ERROR: could not add favorite ${newKey}`,
                              messageBody: error
                            }
                          })
                        }
                      }
                    )
                  }
                }
              )
            }
          }

        }
      )
    }
  }

  /**
  *  @param {string} folderKey
  *  deletes foler with a specified key
  */
  handleDeleteFolder(folderKey) {

    let edgeToDelete = this.props.files.edges.filter((edge) => {

      return edge && edge.node && (folderKey === edge.node.key)
    })[0]

    let edgesToDelete = this.props.files.edges.filter((edge) => {
      return edge && (edge.node.key.indexOf(folderKey) > -1)
    })
    if(edgeToDelete){
      DeleteLabbookFileMutation(
        this.props.connection,
        this.state.owner,
        this.state.labbookName,
        this.props.parentId,
        edgeToDelete.node.id,
        folderKey,
        this.props.section,
        edgesToDelete,
        (response, error) => {
          if(error){
            console.error(error)
            store.dispatch({
              type: 'ERROR_MESSAGE',
              payload: {
                message: `ERROR: could not delete folder ${folderKey}`,
                messageBody: error
              }
            })
          }
        }
      )
    }
  }
  /**
  *  @param {string} fileKey
  *  deletes file with a specified key
  */
  handleDeleteFile(fileKey) {

    let edgeToDelete = this.props.files.edges.filter((edge) => {
      return edge && edge.node && (fileKey === edge.node.key)
    })[0]

    DeleteLabbookFileMutation(
      this.props.connection,
      this.state.owner,
      this.state.labbookName,
      this.props.parentId,
      edgeToDelete.node.id,
      fileKey,
      this.props.section,
      [],
      (response, error) => {
        if(error){
          console.error(error)
          store.dispatch({
            type: 'ERROR_MESSAGE',
            payload: {
              message: `ERROR: could not delete file ${fileKey}`,
              messageBody: error
            }
          })
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
      if(files){
        files.edges.forEach((edge) => {
          if(edge && edge.node){

            formatedArray.push({
              key: edge.node.key,
              modified: edge.node.modifiedAt,
              size: edge.node.size,
              isFavorite: edge.node.isFavorite,
              id: edge.node.id
            })
          }
        })
      }

      return formatedArray
  }
  /**
  *  @param {string} key
  *  triggers file favorite mutation
  */
  handleFileFavoriting(key){

    let fileItem = this.props.files.edges.filter((edge) => {

        if(edge && (edge.node.key === key)){
          return edge.node
        }
    })[0]

    if(!fileItem.node.isFavorite){
      AddFavoriteMutation(
        this.props.favoriteConnection,
        this.props.connection,
        this.props.parentId,
        this.state.owner,
        this.state.labbookName,
        key,
        '',
        false,
        fileItem,
        this.props.section,
        (response, error)=>{
          if(error){
            console.error(error)
            store.dispatch({
              type: 'ERROR_MESSAGE',
              payload: {
                message: `ERROR: could not add favorite ${key}`,
                messageBody: error
              }
            })
          }
        }
      )
    }else{

      RemoveFavoriteMutation(
        this.props.favoriteConnection,
        this.props.parentId,
        this.state.owner,
        this.state.labbookName,
        this.props.section,
        key,
        fileItem.node.id,
        fileItem,
        this.props.favorites,
        (response, error)=>{
          if(error){
            console.error(error)
          }
        }
      )
    }
  }
  /**
  *  @param {object} file
  *  gets a file objext with name, extension, key, url properties
  *  sets as selected item
  */
  openDetailPanel(file){

    this.setState({
      "selectedFile": file
    })

    store.dispatch({
      type: 'UPDATE_DETAIL_VIEW',
      payload: {
        detailMode: true
      }
    })
  }

  render(){

    let files = this._formatFileJson(this.props.files)

    return(
        <div id="code" className="Code flex flex-row justify-center">

          <FileBrowser
            ref={this.props.connection}
            key={this.props.connection}
            keyPrefix={this.props.connection}
            connectionKey={this.props.connection}
            files={files}
            toggleFolder={this.toggleFolder}
            openDetailPanel={this.openDetailPanel}
            rootFolder={this.props.section}
            onCreateFolder={this.handleCreateFolder}
            onCreateFiles={this.handleCreateFiles}
            onMoveFolder={this.handleRenameFolder}
            onMoveFile={this.handleRenameFile}
            onRenameFolder={this.handleRenameFolder}
            onRenameFile={this.handleRenameFile}
            onDeleteFolder={this.handleDeleteFolder}
            onDeleteFile={this.handleDeleteFile}
            onFileFavoriting={this.handleFileFavoriting}
            owner={this.state.owner}
          />


          {
            this.state.uploading &&
            <div className="Code--uploading flex">
              Uploading Files...
              <span className="Code__loading--browser" />
            </div>
          }

          <DetailPanel
            {...this.state.selectedFile}
          />

        </div>
      )
  }
}

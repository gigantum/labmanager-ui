// vendor
import React, { Component } from 'react'
import FileBrowser from 'Submodules/react-keyed-file-browser/FileBrowser/src/browser'
//components
import DetailPanel from './../detail/DetailPanel'
//mutations
import DeleteLabbookFileMutation from 'Mutations/fileBrowser/DeleteLabbookFileMutation'
import MakeLabbookDirectoryMutation from 'Mutations/fileBrowser/MakeLabbookDirectoryMutation'
import MoveLabbookFileMutation from 'Mutations/fileBrowser/MoveLabbookFileMutation'
import AddFavoriteMutation from 'Mutations/fileBrowser/AddFavoriteMutation'
//helpers
import FolderUpload from './folderUpload'

//utilities
import ChunkUploader from 'JS/utils/ChunkUploader'
//store
import store from 'JS/redux/store'
/*
 @param {object} workerData
 uses redux to dispatch file upload to the footer
*/
let fileCompleteCounter = 0

const dispatchLoadingProgress = (workerData) =>{
  let bytesUploaded = (workerData.chunkSize * (workerData.chunkIndex + 1))/1000
  let totalBytes = workerData.fileSizeKb

  store.dispatch({
    type: 'LOADING_PROGRESS',
    payload: {
      bytesUploaded: bytesUploaded < totalBytes ? bytesUploaded : totalBytes,
      totalBytes: totalBytes,
      percentage: Math.floor((bytesUploaded/totalBytes) * 100) > 100 ? 100 : Math.floor((bytesUploaded/totalBytes) * 100),
      open: true,
      uploadMessage: '',
      labbookName: '',
      error: false,
      success: false
    }
  })

  document.getElementById('footerProgressBar').style.width = Math.floor((bytesUploaded/totalBytes) * 100) + '%'
}
/*
 @param {array, number} files,index
 dispatches batch loading progess to the store
*/
const dispatchBatchLoadingProgress = (files, index) =>{


  store.dispatch({
    type: 'BATCH_LOADING_PROGRESS',
    payload: {
      index: index,
      totalFiles: files.length,
      open: true
    }
  })

  document.getElementById('footerProgressBar').style.width = Math.floor((index/files.length) * 100) + '%'
}

/*
 @param {}
 uses redux to dispatch file upload failed status to the footer
*/
const dispatchFailedStatus = () => {
  store.dispatch({
    type: 'UPLOAD_MESSAGE',
    payload: {
      uploadMessage: 'Import failed',
      error: true
    }
  })
}

/*
 @param {string} filePath
  gets new labbook name and url route
 @return
*/
const getRoute = (filepath) => {
  let filename = filepath.split('/')[filepath.split('/').length -1]
  return filename.split('_')[0]

}
/*
 @param {string} filePath
 dispatched upload success message and passes labbookName/route to the footer
*/
const dispatchFinishedStatus = (filepath) =>{
  let route = getRoute(filepath)

   store.dispatch({
     type: 'IMPORT_SUCCESS',
     payload: {
       uploadMessage: `${route} LabBook is Ready`,
       labbookName: route, //route is labbookName
       success: true
     }
   })
}

/*

*/
const dispatchUploadFinished = () => {
  document.getElementById('footerProgressBar').style.opacity = 0;

  store.dispatch({
    type: 'UPLOAD_MESSAGE',
    payload: {
      uploadMessage: 'Upload Succesfull',
      error: false
    }
  })

  setTimeout(()=>{

    document.getElementById('footerProgressBar').style.width = "0%";
    store.dispatch({
      type: 'RESET_FOOTER_STORE',
      payload: {}
    })

    setTimeout(() =>{
      document.getElementById('footerProgressBar').style.opacity = 1;
    }, 1000)
  }, 1000)
}



export default class FileBrowserWrapper extends Component {
  constructor(props){
  	super(props);
    const {owner, labbookName} = store.getState().routes
    this.state = {
      'show': false,
      'selectedFile': null,
      'message': '',
      'files': this._formatFileJson(props.files),
      'labbookName': labbookName,
      'owner': owner
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
        }
      }
    )
  }

  _chunkLoader(filepath, file, data, batchUpload, files, index){

    if(!batchUpload){
      store.dispatch({
        type: 'LOADING_PROGRESS',
        payload:{
          bytesUploaded: 0,
          percentage: 0,
          totalBytes:  file.size/1000,
          open: true
        }
      })
    }else{
      if(index === 0){
        store.dispatch({
          type: 'BATCH_LOADING_PROGRESS',
          payload:{
            index: 0,
            totalFiles:  files.length,
            open: true
          }
        })
      }
    }


    const postMessage = (workerData) => {

     if(workerData.addLabbookFile){
        if(!batchUpload){

          dispatchUploadFinished()
        }else if(batchUpload && ((files.length - 1) === fileCompleteCounter)){

          fileCompleteCounter++

          dispatchBatchLoadingProgress(files, fileCompleteCounter)

          setTimeout(() => {
            dispatchUploadFinished()
            fileCompleteCounter=0;
          }, 500)

        }else{
          fileCompleteCounter++
          dispatchBatchLoadingProgress(files, fileCompleteCounter)
        }


      }else if(workerData.chunkSize){

        if(!batchUpload){
          dispatchLoadingProgress(workerData)
        }
     } else{

       //self._clearState()
     }
   }

   ChunkUploader.chunkFile(data, postMessage)
 }

  /**
  *  @param {string, string} key,prefix  file key, prefix is root folder -
  *  creates a file using AddLabbookFileMutation by passing a blob
  */
  handleCreateFiles(files, prefix) {
    let self = this;

    store.dispatch({
      type: 'UPLOAD_MESSAGE',
      payload:{
        uploadMessage: 'Prepparing Upload',
        error: false
      }
    })

    if(files[0].name){
      const batchUpload = (files.length > 1)

      files.forEach((file, index) => {

        let newKey = prefix;
        if (prefix !== '' && prefix.substring(prefix.length - 1, prefix.length) !== '/') {
          newKey += '/';
        }
        newKey += file.name;

        let fileReader = new FileReader();

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


          fileReader.readAsArrayBuffer(file);
      });
    }else{
      let flattenedFiles = []
      function flattenFiles(filesArray){

          if(filesArray.entry){
            flattenedFiles.push(filesArray)
          }else{
            if(filesArray.forEach){
              filesArray.forEach(filesSubArray => {
                flattenFiles(filesSubArray)
              })
            }
          }
      }

      flattenFiles(files)
      let filterFiles = flattenedFiles.filter((fileItem) => {
          return (fileItem.file.name !== '.DS_Store')
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
      (response) => {

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
                  (response) => {

                    if(response.moveLabbookFile){

                      setTimeout(function(){

                        resolve(response.moveLabbookFile)
                      },1050)
                    }else{

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
        (response, error) => {
          if(error){
            console.error(error)
          }

        }
      )
    }
  }

  /**
  *  @param {string} folderKeyå
  *  deletes foler with a specified key
  */
  handleDeleteFolder(folderKey) {

    let edgeToDelete = this.props.files.edges.filter((edge) => {
      return edge && (folderKey === edge.node.key)
    })[0]

    let edgesToDelete = this.props.files.edges.filter((edge) => {
      return edge && (edge.node.key.indexOf(folderKey) > -1)
    })

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
        }
      }
    )
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

    AddFavoriteMutation(
      this.props.favoriteConnection,
      this.props.connection,
      this.props.parentId,
      this.state.owner,
      this.state.labbookName,
      key,
      '',
      false,
      0,
      fileItem,
      this.props.section,
      (response, error)=>{
        if(error){
          console.error(error)
        }
      }
    )
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

          <DetailPanel
            {...this.state.selectedFile}
          />

        </div>
      )
  }
}

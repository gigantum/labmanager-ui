// vendor
import React, { Component } from 'react'
import RelayRuntime from 'relay-runtime'
import {createFragmentContainer, graphql} from 'react-relay'
import SweetAlert from 'sweetalert-react'
import FileBrowser from 'Submodules/react-keyed-file-browser/FileBrowser/src/browser'
import Moment from 'moment'
import Environment, {relayStore} from 'JS/createRelayEnvironment'
import {getFiles} from 'html-dir-content/dist/html-dir-content'
//components
import DetailPanel from './../detail/DetailPanel'
import DragAndDrop from './DragDrop'
//mutations
import StartContainerMutation from 'Mutations/StartContainerMutation'
import DeleteLabbookFileMutation from 'Mutations/DeleteLabbookFileMutation'
import MakeLabbookDirectoryMutation from 'Mutations/MakeLabbookDirectoryMutation'
import MoveLabbookFileMutation from 'Mutations/MoveLabbookFileMutation'
import AddFavoriteMutation from 'Mutations/AddFavoriteMutation'

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
      loadingState: true,
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
      loadingState: true
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
       uploadMessage: `${route} Lab Book is Ready`,
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

    this.state = {
      'show': false,
      selectedFile: null,
      'message': '',
      'files': this._formatFileJson(props.files)
    }

    this.handleCreateFolder = this.handleCreateFolder.bind(this)
    this.handleCreateFiles = this.handleCreateFiles.bind(this)
    this.handleRenameFolder = this.handleRenameFolder.bind(this)
    this.handleRenameFile = this.handleRenameFile.bind(this)
    this.handleDeleteFolder = this.handleDeleteFolder.bind(this)
    this.handleDeleteFile = this.handleDeleteFile.bind(this)
    this.toggleFolder = this.toggleFolder.bind(this)
    this._openJupyter = this._openJupyter.bind(this)
    this.openDetailPanel = this.openDetailPanel.bind(this)
    this.handleFileFavoriting = this.handleFileFavoriting.bind(this)

  }
  componentDidMount() {
    //DragAndDrop.dragAndDrop()
  }
  /**
  *  @param {string} key - file key
  *  creates a directory using MakeLabbookDirectoryMutation
  */
  handleCreateFolder(key) {
    let self = this;


    MakeLabbookDirectoryMutation(
      this.props.connection,
      localStorage.getItem('username'),
      localStorage.getItem('username'),
      this.props.labbookName,
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

    let self = this
    if(!batchUpload){
      store.dispatch({
        type: 'LOADING_PROGRESS',
        payload:{
          bytesUploaded: 0,
          percentage: 0,
          totalBytes:  file.size/1000,
          loadingState: true
        }
      })
    }else{
      if(index === 0){
        store.dispatch({
          type: 'BATCH_LOADING_PROGRESS',
          payload:{
            index: 0,
            totalFiles:  files.length,
            loadingState: true
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
  handleCreateFiles(files, prefix, items) {
    let self = this;
    console.log(files, prefix, items)

    if(!files[0][0].entry){
      const batchUpload = (files.length > 1)

      let newFiles = files.map((file, index) => {
        let newKey = prefix;
        if (prefix !== '' && prefix.substring(prefix.length - 1, prefix.length) !== '/') {
          newKey += '/';
        }
        newKey += file.name;

        let fileReader = new FileReader();

        fileReader.onloadend = function (evt) {

          let arrayBuffer = evt.target.result;
          let blob = new Blob([new Uint8Array(arrayBuffer)]);
          //complete the progress bar

            //this._importingState();
            let filepath = newKey

            let data = {
              file: file,
              filepath: filepath,
              username: localStorage.getItem('username'),
              accessToken: localStorage.getItem('access_token'),
              connectionKey: self.props.connection,
              labbookName: self.props.labbookName,
              parentId: self.props.parentId,
              section: self.props.section
            }

            self._chunkLoader(filepath, file, data, batchUpload, files, index)
          }


          fileReader.readAsArrayBuffer(file);
      });
    }else{
      console.log(files, prefix, items)
      let flattenedFiles = []
      function flattenFiles(filesArray){
          if(filesArray.entry){
            flattenedFiles.push(filesArray)
          }else{
            filesArray.map(filesSubArray=>{
              flattenFiles(filesSubArray)
            })
          }
      }

      flattenFiles(files)

      console.log(flattenedFiles)

      
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

    let folderToMove = edgesToMove.filter((edge) => {
      return edge.node.key.indexOf('.') < 0
    })[0]

    MakeLabbookDirectoryMutation(
      this.props.connection,
      localStorage.getItem('username'),
      localStorage.getItem('username'),
      this.props.labbookName,
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
                  localStorage.getItem('username'),
                  localStorage.getItem('username'),
                  this.props.labbookName,
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
            this.props.parentId,
            edgeToDelete.node.id,
            oldKey,
            this.props.section,
            (response, error) => {
              if(error){
                console.error(error)
              }

            }
          )
        }).catch(error =>{
          console.error(error[0].message)
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
    let edgeToMove = this.props.files.edges.filter((edge) => {
      if(edge && edge.node){
        return edge && (oldKey === edge.node.key)
      }
    })[0]

    if(edgeToMove){
      MoveLabbookFileMutation(
        this.props.connection,
        localStorage.getItem('username'),
        localStorage.getItem('username'),
        this.props.labbookName,
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
  *  @param {string} folderKey
  *  deletes foler with a specified key
  */
  handleDeleteFolder(folderKey) {
    let self = this

    let edgeToDelete = this.props.files.edges.filter((edge) => {
      return edge && (folderKey === edge.node.key)
    })[0]

    DeleteLabbookFileMutation(
      this.props.connection,
      localStorage.getItem('username'),
      localStorage.getItem('username'),
      this.props.labbookName,
      this.props.parentId,
      edgeToDelete.node.id,
      folderKey,
      this.props.section,
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

    let self = this

    let edgeToDelete = this.props.files.edges.filter((edge) => {
      return edge && (fileKey === edge.node.key)
    })[0]

    DeleteLabbookFileMutation(
      this.props.connection,
      localStorage.getItem('username'),
      localStorage.getItem('username'),
      this.props.labbookName,
      this.props.parentId,
      edgeToDelete.node.id,
      fileKey,
      this.props.section,
      (response, error) => {
        if(error){
          console.error(error)
        }
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
    const username = localStorage.getItem('username')
    let fileItem = this.props.files.edges.filter((edge)=>{
        if(edge.node.key === key){
          return edge.node
        }
    })[0]
    AddFavoriteMutation(
      this.props.favoriteConnection,
      this.props.parentId,
      username,
      this.props.labbookName,
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

  /*
  *  @param {string} key
  *  opens detail panel with information about file with corresponding key
  */
  toggleFolder(key){
    this.props.setRootFolder(key)
  }
  /*
    @param {object} file
    gets a file objext with name, extension, key, url properties
    sets as selected item
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
          />


          <DetailPanel
            {...this.state.selectedFile}
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

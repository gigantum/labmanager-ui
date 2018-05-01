// vendor
import React, { Component } from 'react'
import classNames from 'classnames'
import uuidv4 from 'uuid/v4'
//utilities
import JobStatus from 'JS/utils/JobStatus'
import ChunkUploader from 'JS/utils/ChunkUploader'
//components
import LoginPrompt from 'Components/labbook/branchMenu/LoginPrompt'
//store
import store from 'JS/redux/store'
//queries
import UserIdentity from 'JS/Auth/UserIdentity'
//mutations
import ImportRemoteLabbookMutation from 'Mutations/ImportRemoteLabbookMutation'
import BuildImageMutation from 'Mutations/BuildImageMutation'

/**
  @param {number} bytes
  converts bytes into suitable units
*/
const _humanFileSize = (bytes)=>{

  let thresh = 1000;

  if(Math.abs(bytes) < thresh) {
      return bytes + ' kB';
  }

  let units = ['MB','GB','TB','PB','EB','ZB','YB']

  let u = -1;
  do {
      bytes /= thresh;
      ++u;
  } while(Math.abs(bytes) >= thresh && u < units.length - 1);
  return bytes.toFixed(1)+' '+units[u];
}
/*
 @param {object} workerData
 uses redux to dispatch file upload to the footer
*/
const dispatchLoadingProgress = (wokerData) =>{

  let bytesUploaded = (wokerData.chunkSize * (wokerData.chunkIndex + 1))/1000
  let totalBytes = wokerData.fileSizeKb
  bytesUploaded =  bytesUploaded < totalBytes ? bytesUploaded : totalBytes;
  let totalBytesString = _humanFileSize(totalBytes)
  let bytesUploadedString = _humanFileSize(bytesUploaded)

  store.dispatch({
    type: 'UPLOAD_MESSAGE_UPDATE',
    payload: {
      id: '',
      uploadMessage: `${bytesUploadedString} of ${totalBytesString} uploaded`,
      totalBytes: totalBytes,
      percentage: (Math.floor((bytesUploaded/totalBytes) * 100) <= 100) ? Math.floor((bytesUploaded/totalBytes) * 100) : 100,
    }
  })

  if(document.getElementById('footerProgressBar')){
    document.getElementById('footerProgressBar').style.width = Math.floor((bytesUploaded/totalBytes) * 100) + '%'
  }
}



/*
 @param {}
 uses redux to dispatch file upload failed status to the footer
*/
const dispatchFailedStatus = () => {
  store.dispatch({
    type: 'UPLOAD_MESSAGE_UPDATE',
    payload: {
      uploadMessage: 'Import failed',
      id: '',
      percentage: 0,
      uploadError: true
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
     type: 'IMPORT_MESSAGE_SUCCESS',
     payload: {
       uploadMessage: `${route} LabBook is Ready`,
       id: '',
       labbookName: localStorage.getItem("username") + "/" + route //route is labbookName
     }
   })

   // if(document.getElementById('footerProgressBar')){
   //   document.getElementById('footerProgressBar').style.width = '0%'
   // }
}



export default class ImportModule extends Component {
  constructor(props){
  	super(props);

    this.state = {
      'show': false,
      'message': '',
      'files': [],
      'type': 'info',
      'error': false,
      'isImporting': false,
      'stopPropagation': false,
      'importingScreen': false,
      'importTransition': null,
      'remoteURL': '',
    }


    this._getBlob = this._getBlob.bind(this)
    this._dragoverHandler = this._dragoverHandler.bind(this)
    this._dropHandler = this._dropHandler.bind(this)
    this._dragendHandler = this._dragendHandler.bind(this)
    this._fileSelected = this._fileSelected.bind(this)
    this._fileUpload = this._fileUpload.bind(this)
    this._importingState = this._importingState.bind(this)
    this._clearState = this._clearState.bind(this)
    this._showImportScreen = this._showImportScreen.bind(this)
    this._hideImportScreen = this._hideImportScreen.bind(this)
    this._closeLoginPromptModal = this._closeLoginPromptModal.bind(this)




    const dropzoneIds = ['dropZone', 'dropZone__subtext', 'dropZone__title', 'dropZone__create'];
    let counter = 0;
    //this set of listeners prevent the browser tab from loading the file into the tab view when dropped outside the target element
    window.addEventListener('dragenter', (evt) => { //use evt, event is a reserved word in chrome
      counter++;
      if(document.getElementById('dropZone')){
        this._showImportScreen();
        document.getElementById('dropZone').classList.add('ImportModule__drop-area-highlight')
      }
      if(dropzoneIds.indexOf(evt.target.id) < 0) {
        evt.preventDefault();
        evt.dataTransfer.effectAllowed = 'none';
        evt.dataTransfer.dropEffect = 'none';

      }
    }, false);

    window.addEventListener('dragleave', (evt) => { //use evt, event is a reserved word in chrome
      counter--;
      if(dropzoneIds.indexOf(evt.target.id) < 0) {
        if(document.getElementById('dropZone')){
          if (counter === 0) {
            this._hideImportScreen();
            document.getElementById('dropZone').classList.remove('ImportModule__drop-area-highlight')
          }
        }
      }
    }, false);

    window.addEventListener('dragover', (evt) => {  //use evt, event is a reserved word in chrome
      if(document.getElementById('dropZone')){
        this._showImportScreen();
        document.getElementById('dropZone').classList.add('ImportModule__drop-area-highlight')
      }
      if(dropzoneIds.indexOf(evt.target.id) < 0) {
        evt.preventDefault();
        evt.dataTransfer.effectAllowed = 'none';
        evt.dataTransfer.dropEffect = 'none';
      }
    });

    window.addEventListener('drop', (evt) => { //use evt, event is a reserved word in chrome

      if(document.getElementById('dropZone')){
        this._hideImportScreen();
        document.getElementById('dropZone').classList.remove('ImportModule__drop-area-highlight')
      }
      if(dropzoneIds.indexOf(evt.target.id) < 0) {

        evt.preventDefault();
        evt.dataTransfer.effectAllowed = 'none';
        evt.dataTransfer.dropEffect = 'none';
      }
    });
  }
  componentDidMount() {
    let fileInput = document.getElementById('file__input')
    if(fileInput) {
      let evt = new MouseEvent("click", {"bubbles":false, "cancelable":true});

      fileInput.onclick = (evt) =>{
        evt.cancelBubble = true;
        //stopPropagation(evt)
        evt.stopPropagation(evt)
      }
    }
  }
  /**
  *  @param {object} dataTransfer
  *  preventDefault on dragOver event
  */
  _getBlob = (dataTransfer) => {
    let self = this;
    for (let i=0; i < dataTransfer.files.length; i++) {

      let file = dataTransfer.items ? dataTransfer.items[i].getAsFile() : dataTransfer.files[0];
      if(file.name.slice(file.name.length - 4, file.name.length) !== '.lbk'){

        this.setState({error: true})

        setTimeout(function(){
          self.setState({error: false})
        }, 5000)

      }else{

        this.setState({error: false})
        let fileReader = new FileReader();

        fileReader.onloadend = function (evt) {
          let arrayBuffer = evt.target.result;

          let blob = new Blob([new Uint8Array(arrayBuffer)]);

          self.setState(
            {files: [
              {
                blob: blob,
                file: file,
                arrayBuffer: arrayBuffer,
                filename: file.name}
              ]
            }
          )
          self._fileUpload()

        };
        fileReader.readAsArrayBuffer(file);
      }
    }
  }


  /**
  *  @param {Object} event
  *  preventDefault on dragOver event
  */
  _dragoverHandler = (evt) => {  //use evt, event is a reserved word in chrome

    evt.preventDefault();//this kicks the event up the event loop
  }

  /**
  *  @param {Object} event
  *  handle file drop and get file data
  */
  _dropHandler = (evt) => {

      //use evt, event is a reserved word in chrome
    let dataTransfer = evt.dataTransfer
    evt.preventDefault();
    evt.dataTransfer.effectAllowed = 'none';
    evt.dataTransfer.dropEffect = 'none';

    // If dropped items aren't files, reject them;
    if (dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
        this._getBlob(dataTransfer)
    } else {
      // Use DataTransfer interface to access the file(s)
      for (let i=0; i < dataTransfer.files.length; i++) {

        this.setState({files:[dataTransfer.files[i].name]})
        this._fileUpload()
      }
    }

    return false
  }

  /**
  *  @param {Object}
  *  handle end of dragover with file
  */
  _dragendHandler = (evt) => {  //use evt, event is a reserved word in chrome

    let dataTransfer = evt.dataTransfer;

    evt.preventDefault()
    evt.dataTransfer.effectAllowed = 'none';
    evt.dataTransfer.dropEffect = 'none';

    if (dataTransfer.items) {
      // Use DataTransferItemList interface to remove the drag data
      for (let i = 0; i < dataTransfer.items.length; i++) {
        dataTransfer.items.remove(i);
      }
    } else {
      // Use DataTransfer interface to remove the drag data
      evt.dataTransfer.clearData();
    }
    return false
  }
  /**
  *  @param {Object}
  *  opens file system for user to select file
  */
  _fileSelected = (evt) => {

    this._getBlob(document.getElementById('file__input'))
    this.setState({'stopPropagation': false})
  }
  /**
  *  @param {Object}
  *   trigger file upload
  */
  _fileUpload = () => {//this code is going to be moved to the footer to complete the progress bar
    let self = this;

    this._importingState();

    let filepath = this.state.files[0].filename

    let data = {
      file: this.state.files[0].file,
      filepath: filepath,
      username: localStorage.getItem('username'),
      accessToken: localStorage.getItem('access_token')
    }

    //dispatch loading progress
    store.dispatch({
      type: 'UPLOAD_MESSAGE_SETTER',
      payload:{
        uploadMessage: 'Prepparing Import ...',
        totalBytes: this.state.files[0].file.size/1000,
        percentage: 0,
        id: ''
      }
    })

    const postMessage = (wokerData) => {


     if(wokerData.importLabbook){

        store.dispatch({
          type: 'UPLOAD_MESSAGE_UPDATE',
          payload: {
            uploadMessage: 'Upload Complete',
            percentage: 100,
            id: ''
          }
        })


        let importLabbook = wokerData.importLabbook
         JobStatus.getJobStatus(importLabbook.importJobKey).then((response)=>{

           store.dispatch({
             type: 'UPLOAD_MESSAGE_UPDATE',
             payload: {
               uploadMessage: 'Unzipping labbook',
               percentage: 100,
               id: ''
             }
           })

           if(response.jobStatus.status === 'finished'){

             dispatchFinishedStatus(filepath)

             self._clearState()

           }else if(response.jobStatus.status === 'failed'){

             dispatchFailedStatus()

             self._clearState()

           }
         }).catch((error)=>{
           console.log(error)
           store.dispatch({
             type: 'UPLOAD_MESSAGE_UPDATE',
             payload: {
               uploadMessage: 'Import failed',
               uploadError: true,
               id: '',
               percentage: 0,
             }
           })
           self._clearState()
         })
      }else if(wokerData.chunkSize){

        dispatchLoadingProgress(wokerData)

     } else{
       store.dispatch({
         type: 'UPLOAD_MESSAGE_UPDATE',
         payload: {
           uploadMessage: wokerData[0].message,
           uploadError: true,
           id: '',
           percentage: 0
         }
       })
       self._clearState()
     }
   }

   ChunkUploader.chunkFile(data, postMessage);
 }
  /**
    @param {object} error
    shows error message
  **/
  _showError(message){

    store.dispatch({
      type: 'UPLOAD_MESSAGE_UPDATE',
      payload: {
        uploadMessage: message,
        uploadError: true,
        id: '',
        percentage: 0
      }
    })
  }
  /**
  *  @param {}
  *  sets state of app for importing
  *  @return {}
  */
  _importingState = () => {
    //document.getElementById('dropZone__filename').classList.add('ImportModule__animation')
    this.setState({
      isImporting: true
    })
  }

  /**
  *  @param {}
  *  clears state of file and sets css back to import
  *  @return {}
  */
  _clearState = () => {
    if(document.getElementById('dropZone__filename')){
        document.getElementById('dropZone__filename').classList.remove('ImportModule__animation')
    }

    this.setState({
      files:[],
      isImporting: false
    })
  }

  /**
  *  @param {}
  *  @return {string} returns text to be rendered
  */
  _getImportDescriptionText(){
    return this.state.error ? 'File must be .lbk' : 'Drag & Drop .lbk file, or click to select.'
  }

  _showModal(evt){
    if (navigator.onLine){
      if(evt.target.id !== 'file__input-label'){
        this.props.showModal()
      }
    } else {
      store.dispatch({
        type: 'ERROR_MESSAGE',
        payload:{
          message: `Cannot create a labbook at this time.`,
          messageBody: [{message: 'An internet connection is required to create a Labbook.'}]
        }
      })
    }
  }

  _showImportScreen() {
    if(!this.state.importTransition && !this.state.importingScreen) {
      this.setState({importTransition: true});
      setTimeout(()=>{
        this.setState({importingScreen: true});
      }, 250)
    }
  }

  _hideImportScreen() {
    if(this.state.importingScreen) {
      this.setState({importTransition: false});
      setTimeout(()=>{
        this.setState({importingScreen: false});
      }, 250)
    }
  }

  _updateRemoteUrl(evt){
    this.setState({
      remoteURL: evt.target.value
    })
  }

  /**
  *  @param {Object} evt
  *  imports labbook from remote url, builds the image, and redirects to imported labbook
  *  @return {}
  */
  importLabbook = (evt) => {
    const id = uuidv4()

    let self = this;
    const labbookName = this.state.remoteURL.split('/')[this.state.remoteURL.split('/').length - 1]
    const owner = this.state.remoteURL.split('/')[this.state.remoteURL.split('/').length - 2]
    const remote = this.state.remoteURL.indexOf('https://') > -1 ? this.state.remoteURL + '.git' : 'https://' + this.state.remoteURL + '.git'

    UserIdentity.getUserIdentity().then(response => {

    if(response.data){

      if(response.data.userIdentity.isSessionValid){
        this._importingState()
        store.dispatch(
          {
            type: "MULTIPART_INFO_MESSAGE",
            payload: {
              id: id,
              message: 'Importing LabBook please wait',
              isLast: false,
              error: false
            }
          })
        ImportRemoteLabbookMutation(
          owner,
          labbookName,
          remote,
          (response, error) => {
            this._clearState();

            if(error){
              console.error(error)
              store.dispatch(
                {
                  type: 'MULTIPART_INFO_MESSAGE',
                  payload: {
                    id: id,
                    message: 'ERROR: Could not import remote LabBook',
                    messageBody: error,
                    error: true
                }
              })

            }else if(response){

              store.dispatch(
                {
                  type: 'MULTIPART_INFO_MESSAGE',
                  payload: {
                    id: id,
                    message: `Successfully imported remote LabBook ${labbookName}`,
                    isLast: true,
                    error: false
                  }
                })
              BuildImageMutation(
              labbookName,
              owner,
              false,
              (response, error)=>{
                if(error){
                  console.error(error)
                  store.dispatch(
                    {
                      type: 'MULTIPART_INFO_MESSAGE',
                      payload: {
                        id: id,
                        message: `ERROR: Failed to build ${labbookName}`,
                        messsagesList: error,
                        error: true
                    }
                  })
                }
              })
              document.getElementById('modal__cover').classList.add('hidden')
              self.props.history.replace(`/labbooks/${owner}/${labbookName}`)
            }else{

              BuildImageMutation(
              labbookName,
              localStorage.getItem('username'),
              false,
              (error)=>{
                if(error){
                  console.error(error)
                  store.dispatch(
                    {
                      type: 'MULTIPART_INFO_MESSAGE',
                      payload: {
                        id: id,
                        message: `ERROR: Failed to build ${labbookName}`,
                        messsagesList: error,
                        error: true
                    }
                  })
                }
              })
            }
          }
        )
      }else{
          this.setState({'showLoginPrompt': true})
          document.getElementById('modal__cover').classList.remove('hidden')
      }
      }
    })
  }

  _closeLoginPromptModal(){
    this.setState({
      'showLoginPrompt': false
    })
    document.getElementById('modal__cover').classList.add('hidden')
  }

  render(){
    let importCSS = classNames({
      'LocalLabbooks__labbook-button-import': this.state.importTransition === null,
      'LocalLabbooks__labbook-button-import--expanding': this.state.importTransition,
      'LocalLabbooks__labbook-button-import--collapsing': !this.state.importTransition && this.state.importTransition !== null
    })
    let loginPromptModalCss = classNames({
      'LocalLabbooks--login-prompt': this.state.showLoginPrompt,
      'hidden': !this.state.showLoginPrompt
    })

    return(
      <div
        id="dropZone"
        type="file"
        className="ImportModule LocalLabbooks__panel LocalLabbooks__panel--add LocalLabbooks__panel--import column-4-span-3"
        ref={(div) => this.dropZone = div}
        onDragEnd={(evt) => this._dragendHandler(evt)}
        onDrop={(evt) => this._dropHandler(evt)}
        onDragOver={(evt) => this._dragoverHandler(evt)}
        key={'addLabbook'}>
        { !this.state.importingScreen ?
          <div className="LocalLabbooks__labbook-main">
            <div className="LocalLabbooks__labbook-header">
              <div
                className="LocalLabbooks__labbook-icon">
                <div className="LocalLabbooks__title-add"></div>
              </div>
              <div
                className="LocalLabbooks__add-text">
                <h4>Add LabBook</h4>
              </div>
            </div>
            <div className="LocalLabbooks__labbook-button"
              onClick={(evt) => { this._showModal(evt) }}>
              Create New
            </div>
            <div className={importCSS}
              onClick={()=>{this._showImportScreen()}}>
              Import Existing
            </div>
          </div>
          :
          <div id="dropZone__title" className="LocalLabbooks__labbook-importing">
            <div
              className="Locallabbook__import-close"
              onClick={() => this._hideImportScreen()}>
            </div>
            <div className="LocalLabbooks__labbook-import-header">
              <h4 id="dropZone__create">
                Import Existing
              </h4>
              <p>
                to import, do one of the following
              </p>
            </div>
            <p id="dropZone__subtext">
              Drag .lbk File Here
            </p>
            <label
              className="LocalLabbooks__file-system"
              id="file__input-label"
              htmlFor="file__input">
              Browse & Upload .lbk File
            </label>
            <input
              id="file__input"
              className='hidden'
              type="file"
              onChange={(evt) => { this._fileSelected(evt.files) }}
            />
            <div className="LocalLabbooks__labbook-paste">
              <input
                type="text"
                placeholder="Paste LabBook URL"
                onChange={(evt) => this._updateRemoteUrl(evt)}
              />
              <button
                onClick={() => this.importLabbook()}
                disabled={!this.state.remoteURL.length && !this.state.isImporting}
              >
                Go
              </button>
            </div>
          </div>
        }
        <div className={loginPromptModalCss}>
          <div
            onClick={() => { this._closeLoginPromptModal() }}
            className="LocalLabbooks-login-prompt--close"></div>
          <LoginPrompt closeModal={this._closeLoginPromptModal} />
        </div>
        <div className={this.state.isImporting ? 'ImportModule__loading-mask' : 'hidden'}></div>

      </div>
      )
  }
}

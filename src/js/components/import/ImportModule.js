// vendor
import React, { Component } from 'react'
import SweetAlert from 'sweetalert-react'
//mutations
import ImportLabbookMutation from 'Mutations/ImportLabbookMutation'
//utilities
import JobStatus from 'JS/utils/JobStatus'
import ChunkUploader from 'JS/utils/ChunkUploader'

import store from 'JS/redux/store'

export default class ImportModule extends Component {
  constructor(props){
  	super(props);
    console.log(this)
    this.state = {
      'show': false,
      'message': '',
      'files': [],
      'type': 'info',
      'error': false,
      'isImporting': false
    }


    this._getBlob = this._getBlob.bind(this)
    this._dragoverHandler = this._dragoverHandler.bind(this)
    this._dropHandler = this._dropHandler.bind(this)
    this._dragendHandler = this._dragendHandler.bind(this)
    this._fileSelected = this._fileSelected.bind(this)
    this._fileUpload = this._fileUpload.bind(this)
    this._importingState = this._importingState.bind(this)
    this._clearState = this._clearState.bind(this)



    const dropzoneIds = ['dropZone', 'dropZone__helper', 'dropZone__filename'];

    //this set of listeners prevent the browser tab from loading the file into the tab view when dropped outside the target element
    window.addEventListener('dragenter', function(evt) { //use evt, event is a reserved word in chrome
      if(document.getElementById('dropZone')){
        document.getElementById('dropZone').classList.add('ImportModule__drop-area-highlight')
      }
      if(dropzoneIds.indexOf(evt.target.id) < 0) {
        evt.preventDefault();
        evt.dataTransfer.effectAllowed = 'none';
        evt.dataTransfer.dropEffect = 'none';

      }
    }, false);

    window.addEventListener('dragleave', function(evt) { //use evt, event is a reserved word in chrome

      if(dropzoneIds.indexOf(evt.target.id) < 0) {
        if(document.getElementById('dropZone')){
          document.getElementById('dropZone').classList.remove('ImportModule__drop-area-highlight')
        }
      }
    }, false);

    window.addEventListener('dragover', function(evt) {  //use evt, event is a reserved word in chrome
      if(document.getElementById('dropZone')){
        document.getElementById('dropZone').classList.add('ImportModule__drop-area-highlight')
      }
      if(dropzoneIds.indexOf(evt.target.id) < 0) {
        evt.preventDefault();
        evt.dataTransfer.effectAllowed = 'none';
        evt.dataTransfer.dropEffect = 'none';
      }
    });

    window.addEventListener('drop', function(evt) { //use evt, event is a reserved word in chrome
      if(document.getElementById('dropZone')){
        document.getElementById('dropZone').classList.remove('ImportModule__drop-area-highlight')
      }
      if(dropzoneIds.indexOf(evt.target.id) < 0) {

        evt.preventDefault();
        evt.dataTransfer.effectAllowed = 'none';
        evt.dataTransfer.dropEffect = 'none';
      }
    });
  }
  /**
  *  @param {object} dataTransfer
  *  preventDefault on dragOver event
  */
  _getBlob = (dataTransfer) => {
    let that = this;
    for (let i=0; i < dataTransfer.files.length; i++) {

      let file = dataTransfer.items ? dataTransfer.items[i].getAsFile() : dataTransfer.files[0];
      if(file.name.slice(file.name.length - 4, file.name.length) !== '.lbk'){

        this.setState({error: true})

        setTimeout(function(){
          that.setState({error: false})
        }, 5000)

      }else{

        this.setState({error: false})
        let fileReader = new FileReader();

        fileReader.onloadend = function (evt) {
          let arrayBuffer = evt.target.result;

          let blob = new Blob([new Uint8Array(arrayBuffer)]);

          that.setState(
            {files: [
              {
                blob: blob,
                file: file,
                arrayBuffer: arrayBuffer,
                filename: file.name}
              ]
            }
          )

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
  }
  /**
  *  @param {Object}
  *   trigger file upload
  */
  _fileUpload = (evt) => {//this code is going to be moved to the footer to complete the progress bar
    let self = this;

    this._importingState();

    let filepath = this.state.files[0].filename

    let chunkUploadWorker = new ChunkUploader();

    let data = {
      file: this.state.files[0].file,
      filepath: filepath,
      username: localStorage.getItem('username'),
      accessToken: localStorage.getItem('access_token')
    }

    chunkUploadWorker.postMessage(data);

    // chunkUploadWorker.addListener('uncoverMask', function (result) {
    //   self._clearState()
    // });

    this._chunkLoader(chunkUploadWorker, filepath, this.state.files[0].file)


  }

  _chunkLoader(chunkWorker, filepath, file){

    store.dispatch({
      type: 'LOADING_PROGRESS',
      payload:{
        bytesUploaded: 0,
        percentage: 0,
        totalBytes:  file.size,
        loadingState: true
      }
    })


    let self = this
    chunkWorker.onmessage = function(e) {

     if(e.data.importLabbook){
        chunkWorker.terminate()
        store.dispatch({
          type: 'UPLOAD_MESSAGE',
          payload: {uploadMessage: 'Upload Complete'}
        })


        let importLabbook = e.data.importLabbook
         JobStatus.getJobStatus(importLabbook.importJobKey).then((response)=>{

           store.dispatch({
             type: 'UPLOAD_MESSAGE',
             payload: {uploadMessage: 'Unzipping labbook'}
           })

           console.log(response, e.data)
           if(response.jobStatus.status === 'finished'){

             let route = self._getRoute()
             self.props.history.replace(`/labbooks/${route}`)
             self._clearState()

           }else if(response.jobStatus.status === 'failed'){
             console.log(response)

             store.dispatch({
               type: 'UPLOAD_MESSAGE',
               payload: {
                 uploadMessage: 'Import failed',
                 error: true
               }
             })

           }
         }).catch((error)=>{
           store.dispatch({
             type: 'UPLOAD_MESSAGE',
             payload: {
               uploadMessage: 'Computation Error',
               error: true
             }
           })
           //self._clearState()
         })
      }else if(e.data.chunkSize){
        let  bytesUploaded = (e.data.chunkSize * (e.data.chunkIndex + 1))/1024
        let totalBytes = e.data.fileSizeKb * 1024

        store.dispatch({
          type: 'LOADING_PROGRESS',
          payload: {
            bytesUploaded: bytesUploaded < totalBytes ? bytesUploaded : totalBytes,
            totalBytes: totalBytes,
            percentage: Math.floor((bytesUploaded/totalBytes) * 100),
            loadingState: true
          }
        })

        document.getElementById('footerProgressBar').style.width = Math.floor((bytesUploaded/totalBytes) * 100) + '%'
     } else{
       //self._clearState()
       chunkWorker.terminate()
       self._showError(e.data)
     }
   }
 }
  /**
    @param {object} error
    shows error message
  **/
  _showError(message){
    this.setState({
      'show': true,
      'message': message,
      'type': 'error'
    })
  }
  /**
  *  @param {}
  *  sets state of app for importing
  *  @return {}
  */
  _importingState = () => {
    document.getElementById('dropZone__filename').classList.add('ImportModule__animation')
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
    document.getElementById('dropZone__filename').classList.remove('ImportModule__animation')
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
  render(){

    return(
      <div className="ImportModule LocalLabbooks__panel LocalLabbooks__panel--import">
        <label htmlFor="file__input">

            <button
              id="file__upload"
              className={'ImportModule__upload-button'}
              onClick={(evt)=>{this._fileUpload(evt)}}
              disabled={(this.state.files.length < 1)}
            >
              Import Lab Book
            </button>
            <div
              id="dropZone"
              type="file"
              className="ImportModule__drop-area flex justify-center"
              ref={(div)=> this.dropZone = div}
              onDragEnd={(evt)=> this._dragendHandler(evt)}
              onDrop={(evt) => this._dropHandler(evt)}
              onDragOver={(evt)=> this._dragoverHandler(evt)}>
                {
                (this.state.files.length < 1) &&
                  <h6 className={this.state.error ? 'ImportModule__instructions--error' : 'ImportModule__instructions'}
                      id="dropZone__helper">
                      {this._getImportDescriptionText()}
                  </h6>
                }
                {
                  (this.state.files.length > 0) &&

                    <h6 id="dropZone__filename">{this.state.files[0].filename}</h6>
                }
            </div>
          </label>

          <input
            id="file__input"
            className='hidden'
            type="file"
            onChange={(evt)=>{this._fileSelected(evt.files)}}
          />

          <div className={this.state.isImporting ? 'ImportModule__loading-mask' : 'hidden'}></div>

          <SweetAlert
            className="sa-error-container"
            show={this.state.show}
            type={this.state.type}
            title={this.state.message}
            onConfirm={() => {
              this.setState({ show: false})
            }}
            />

      </div>
      )
  }
}

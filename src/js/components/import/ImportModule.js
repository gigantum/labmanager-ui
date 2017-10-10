// vendor
import React, { Component } from 'react'
//mutations
import ImportLabbookMutation from 'Mutations/ImportLabbookMutation'
let importModule;

export default class ImportModule extends Component {
  constructor(props){
  	super(props);

    this.state = {
      'show': false,
      'message': '',
      'files': [],
      'error': false
    }

    importModule = this;
    const dropzoneIds = ['dropZone', 'dropZone__helper', 'dropZone__filename'];

    //this set of listeners prevent the browser tab from loading the file into the tab view when dropped outside the target element
    window.addEventListener('dragenter', function(evt) { //use evt, event is a reserved word in chrome
      document.getElementById('dropZone').classList.add('ImportModule__drop-area-highlight')
      if(dropzoneIds.indexOf(evt.target.id) < 0) {
        evt.preventDefault();
        evt.dataTransfer.effectAllowed = 'none';
        evt.dataTransfer.dropEffect = 'none';

      }
    }, false);

    window.addEventListener('dragleave', function(evt) { //use evt, event is a reserved word in chrome

      if(dropzoneIds.indexOf(evt.target.id) < 0) {
        document.getElementById('dropZone').classList.remove('ImportModule__drop-area-highlight')
      }
    }, false);

    window.addEventListener('dragover', function(evt) {  //use evt, event is a reserved word in chrome

      document.getElementById('dropZone').classList.add('ImportModule__drop-area-highlight')
      if(dropzoneIds.indexOf(evt.target.id) < 0) {
        evt.preventDefault();
        evt.dataTransfer.effectAllowed = 'none';
        evt.dataTransfer.dropEffect = 'none';
      }
    });

    window.addEventListener('drop', function(evt) { //use evt, event is a reserved word in chrome
      document.getElementById('dropZone').classList.remove('ImportModule__drop-area-highlight')
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
  _getBlob(dataTransfer){
    for (let i=0; i < dataTransfer.files.length; i++) {

      let file = dataTransfer.items ? dataTransfer.items[i].getAsFile() : dataTransfer.files[0];
      console.log(file.name.slice(file.name.length - 4, file.name.length))
      if(file.name.slice(file.name.length - 4, file.name.length) !== '.lbk'){

        this.setState({error: true})

        setTimeout(function(){
          importModule.setState({error: false})
        },5000)

      }else{
        this.setState({error: false})
        let fileReader = new FileReader();

        fileReader.onloadend = function (e) {
          let arrayBuffer = e.target.result;
          let blob = new Blob([new Uint8Array(arrayBuffer)]);

          console.log(blob, arrayBuffer, file)

          importModule.setState(
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
  _dragoverHandler(evt) {  //use evt, event is a reserved word in chrome

    evt.preventDefault();//this kicks the event up the event loop
  }

  /**
  *  @param {Object} event
  *  handle file drop and get file data
  */
  _dropHandler(evt){
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
  _dragendHandler(evt){  //use evt, event is a reserved word in chrome

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
  _fileSelected(evt){
     this._getBlob(document.getElementById('file__input'))
  }
  /**
  *  @param {Object}
  *   trigger file upload
  */
  _fileUpload(evt){

    document.getElementById('dropZone__filename').classList.add('ImportModule__animation')
    ImportLabbookMutation('default', 'default', this.state.files[0].file, (result, error)=>{
      console.log(result, error)
    })
    setTimeout(function(){
      document.getElementById('dropZone__filename').classList.remove('ImportModule__animation')
      importModule.setState({
        files:[]
      })
    }, 1000)
  }

  /**
  *  @param {}
  *  @return {string} returns text to be rendered
  */
  _getImportDescriptionText(){
    return this.state.error ? 'File must be .lbk' : 'Drag & Drop lbk file, or click to select.'
  }
  render(){

    return(
      <div className="ImportModule">
        <label htmlFor="file__input">
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

          <button
            id="file__upload"
            className={(this.state.files.length < 1) ? 'hidden' : 'ImportModule__upload-button'}
            onClick={(evt)=>{this._fileUpload(evt)}}
            disabled={(this.state.files.length < 1)}
          >
            Import
          </button>

      </div>
      )
  }
}

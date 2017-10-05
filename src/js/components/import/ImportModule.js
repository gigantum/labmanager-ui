// vendor
import React, { Component } from 'react'

let importModule;

export default class ImportModule extends Component {
  constructor(props){
  	super(props);

    this.state = {
      'show': false,
      'message': '',
      'files': []
    }

    importModule = this;
    const dropzoneId = 'dropZone';
    //this set of listeners prevent the browser tab from loading the file into the tab view when dropped outside the target element
    window.addEventListener('dragenter', function(evt) { //use evt, event is a reserved word in chrome
      if (evt.target.id !== dropzoneId) {
        evt.preventDefault();
        evt.dataTransfer.effectAllowed = 'none';
        evt.dataTransfer.dropEffect = 'none';
      }
    }, false);

    window.addEventListener('dragover', function(evt) {  //use evt, event is a reserved word in chrome
      if (evt.target.id !== dropzoneId) {
        evt.preventDefault();
        evt.dataTransfer.effectAllowed = 'none';
        evt.dataTransfer.dropEffect = 'none';
      }
    });

    window.addEventListener('drop', function(evt) { //use evt, event is a reserved word in chrome
      if (evt.target.id !== dropzoneId) {
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
    console.log(dataTransfer.files)
    for (let i=0; i < dataTransfer.files.length; i++) {
      console.log( dataTransfer.items)
      let file = dataTransfer.items ? dataTransfer.items[i].getAsFile() : dataTransfer.files[0];
      console.log(file)
      let fileReader = new FileReader();
      fileReader.onloadend = function (e) {
        var arrayBuffer = e.target.result;
        let blob = new Blob([new Uint8Array(arrayBuffer)]);
        console.log(file)
        importModule.setState({files: [{blob: blob, file: file, filename: file.name}]})
        console.log(importModule.state.files)
      };
      fileReader.readAsArrayBuffer(file);
    }
  }


  /**
  *  @param {Object} event
  *  preventDefault on dragOver event
  */
  _dragoverHandler(evt) {  //use evt, event is a reserved word in chrome
    console.log(evt)
    evt.preventDefault();//this kicks the event up the event loop
  }

  /**
  *  @param {Object} event
  *  handle file drop and get file data
  */
  _dropHandler(evt){
    console.log(evt)
      //use evt, event is a reserved word in chrome
    let dataTransfer = evt.dataTransfer
    evt.preventDefault();
    evt.dataTransfer.effectAllowed = "none";
    evt.dataTransfer.dropEffect = "none";

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
    console.log(evt)
    let dataTransfer = evt.dataTransfer;

    evt.preventDefault()
    evt.dataTransfer.effectAllowed = "none";
    evt.dataTransfer.dropEffect = "none";

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
    console.log(evt, this)

     this._getBlob(document.getElementById("file-input"))

  }

  render(){

    return(
      <div className={this.props.isOpen ? 'ImportCode WizardModal' : 'ImportCode hidden'}>
        <label htmlFor="file-input">
            <div
              id="dropZone"
              type="file"
              className="ImportCode__drop-area"
              ref={(div)=> this.dropZone = div}
              onDragEnd={(evt)=> this._dragendHandler(evt)}
              onDrop={(evt) => this._dropHandler(evt)}
              onDragOver={(evt)=> this._dragoverHandler(evt)}>
                Drop files here
                {
                  (this.state.files.length > 0) &&
                  <div>
                    {this.state.files[0].filename}
                  </div>
                }
            </div>
          </label>

          <input className='hidden' type="file" id="file-input" onChange={(evt)=>{this._fileSelected(evt.files)}}/>

      </div>
      )
  }
}

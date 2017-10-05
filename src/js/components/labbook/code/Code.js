// vendor
import React, { Component } from 'react'
import SweetAlert from 'sweetalert-react';
//mutations
import StartContainerMutation from 'Mutations/StartContainerMutation'

let code;
export default class Code extends Component {
  constructor(props){
  	super(props);

    this.state = {
      'show': false,
      'message': ''
    }

    code = this;
    const dropzoneId = 'dropZone';

    window.addEventListener("dragenter", function(e) {
      if (e.target.id !== dropzoneId) {
        e.preventDefault();
        e.dataTransfer.effectAllowed = "none";
        e.dataTransfer.dropEffect = "none";
      }
    }, false);

    window.addEventListener("dragover", function(e) {
      if (e.target.id !== dropzoneId) {
        e.preventDefault();
        e.dataTransfer.effectAllowed = "none";
        e.dataTransfer.dropEffect = "none";
      }
    });

    window.addEventListener("drop", function(e) {
      if (e.target.id !== dropzoneId) {
        e.preventDefault();
        e.dataTransfer.effectAllowed = "none";
        e.dataTransfer.dropEffect = "none";
      }
    });
  }

  _openJupyter(){

    StartContainerMutation(
      this.props.labbookName,
      'default',
      'clientMutationId',
      (error) =>{
        if(error){
          code.setState({
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

  _dragoverHandler(ev) {
    console.log("dragOver");
    // Prevent default select and drag behavior
    ev.preventDefault();
    // ev.dataTransfer.effectAllowed = "none";
    // ev.dataTransfer.dropEffect = "none";
    // return false
  }

  _dropHandler(ev){
    console.log("Drop");
    ev.preventDefault();
    ev.dataTransfer.effectAllowed = "none";
    ev.dataTransfer.dropEffect = "none";


    // If dropped items aren't files, reject them
    let dt = ev.dataTransfer;
    console.log(ev.dataTransfer)
    if (dt.items) {
      // Use DataTransferItemList interface to access the file(s)
      for (let i=0; i < dt.items.length; i++) {
        if (dt.items[i].kind === "file") {
          let f = dt.items[i].getAsFile();
          console.log("... file[" + i + "].name = " + f.name);
        }
      }
    } else {
      // Use DataTransfer interface to access the file(s)
      for (let i=0; i < dt.files.length; i++) {
        console.log("... file[" + i + "].name = " + dt.files[i].name);
      }
    }

    return false
  }
  _dragendHandler(ev){
    console.log("dragEnd");
    // Remove all of the drag data
    ev.preventDefault()
    ev.dataTransfer.effectAllowed = "none";
    ev.dataTransfer.dropEffect = "none";
    let dt = ev.dataTransfer;
    if (dt.items) {
      // Use DataTransferItemList interface to remove the drag data
      for (let i = 0; i < dt.items.length; i++) {
        dt.items.remove(i);
      }
    } else {
      // Use DataTransfer interface to remove the drag data
      ev.dataTransfer.clearData();
    }
    return false
  }

  render(){

    return(
        <div id="code" className="Code flex flex-row justify-center">
          <button className="Code__open-jupyter" onClick={() => this._openJupyter()}
          target="_blank">
            Open Jupyter
          </button>

          <div id="dropZone" onDragEnd={(evt)=> this._dragendHandler(evt)} onDrop={(evt) => this._dropHandler(evt)} onDragOver={(evt)=> this._dragoverHandler(evt)}>This element is draggable.</div>

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

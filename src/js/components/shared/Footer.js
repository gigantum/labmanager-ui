import React, { Component } from 'react'
import JobStatus from 'JS/utils/JobStatus'

import store from "JS/redux/store"

export default class Footer extends Component {

  constructor(props){
    super(props)

    this.state = store.getState()
    this._clearState = this._clearState.bind(this)

    /*
      subscribe to store to update state
    */
    store.subscribe(() =>{
      this.storeDidUpdate(store.getState().footer)
    })
  }

  storeDidUpdate = () => {
    this.setState(store.getState().footer);//triggers re-render when store updates
  }

  _openLabbook(){
    this._clearState()
    this.props.history.replace(`/labbooks/${this.state.labbookName}`)
  }
  /**
    @param {}
    add scroll listener to pop up footer
  */
  _clearState(){

    document.getElementById('footerProgressBar').style.opacity = 0;

    store.dispatch({type:'RESET_STORE', payload:{}})

    setTimeout(()=>{
      document.getElementById('footerProgressBar').style.width = "0%";
      setTimeout(() =>{
        document.getElementById('footerProgressBar').style.opacity = 1;
      }, 1000)

    },1000)
  }

  /*
    @param {number} bytes
    converts bytes into suitable units
  */
 _humanFileSize(bytes){

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
  @param {}
  gets upload message which tracks progess
 */
 _getMessage(){
   let uploadProgress = this._humanFileSize(this.state.bytesUploaded)

   let total = this._humanFileSize(this.state.totalBytes)

   let message = this.state.uploadMessage ? this.state.uploadMessage : uploadProgress + ' of ' + total + ' uploaded (' + this.state.percentage + '%)'

   return message
 }

 render() {
    return (
      <div id="footer" className={this.state.loadingState ? 'Footer Footer__expand' : 'Footer'}>

        <div
          className={this.state.loadingState ? 'Footer__status' : 'hidden'}>
            {this._getMessage()}
        </div>

        <div
          id="footerProgressBar" className={(this.state.error) ? 'Footer__progress-bar Footer__progress-bar__error' : 'Footer__progress-bar' }>
        </div>

        {this.state.error &&
          <button
            className="Footer__button"
            onClick={()=> this._clearState()}>
            Got It
          </button>
        }

        {this.state.success &&
          <button
            className="Footer__button"
            onClick={()=> this._openLabbook()}>
            Open Lab Book
          </button>
        }
      </div>
    )
  }
}

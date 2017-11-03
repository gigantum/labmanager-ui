import React, { Component } from 'react'
import JobStatus from 'JS/utils/JobStatus'

import store from "JS/redux/store"

export default class Footer extends Component {

  constructor(props){
    super(props)
    this.state = {
      bytesUploaded: 0,
      totalBytes: 0,
      percentage: 0,
      loadingState: false,
      uploadMessage: '',
      error: false
    }

    this._clearState = this._clearState.bind(this)
    this._getRoute = this._getRoute.bind(this)

    store.subscribe(() =>{
        console.log(store.getState())
    })
  }
  /**
    @param {}
    add scroll listener to pop up footer
  */

  _clearState(){

    document.getElementById('footerProgressBar').style.opacity = 0;

    this.setState({
      bytesUploaded: 0,
      totalBytes: 0,
      percentage: 0,
      loadingState: false,
      uploadMessage: '',
      error: false
    })


    setTimeout(()=>{
      document.getElementById('footerProgressBar').style.width = "0%";
      setTimeout(() =>{
        document.getElementById('footerProgressBar').style.opacity = 1;
      }, 1000)

    },1000)
  }

  _showError(message){
    console.log(message)
  }

  _getRoute(){
    console.log(this)
    let filename = this.props.filepath.split('/')[this.props.filepath.split('/').length -1]
    return filename.split('_')[0]

  }

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
      </div>
    )
  }
}

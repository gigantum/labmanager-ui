import React, { Component } from 'react'
import classNames from 'classnames'
//utilities
import JobStatus from 'JS/utils/JobStatus'
//store
import store from "JS/redux/store"


let unsubscribe

export default class Footer extends Component {

  constructor(props){
    super(props)

    this.state = store.getState().footer

    this._clearState = this._clearState.bind(this)
  }
  /**
    subscribe to store to update state
  */
  componentDidMount() {

    unsubscribe = store.subscribe(() =>{

      this.storeDidUpdate(store.getState().footer)
    })

  }
  /**
    unsubscribe from redux store
  */
  componentWillUnmount() {
    unsubscribe()
  }
  /**
    @param {object} footer
    unsubscribe from redux store
  */
  storeDidUpdate = (footer) => {

    let footerString = JSON.stringify(footer)
    let stateString = JSON.stringify(this.state)

    if(footerString !== stateString){
      console.log(footer)
      this.setState(footer);//triggers re-render when store updates
    }
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

    store.dispatch({type:'RESET_FOOTER_STORE', payload:{}})

    setTimeout(()=>{
      document.getElementById('footerProgressBar').style.width = "0%";
      setTimeout(() =>{
        document.getElementById('footerProgressBar').style.opacity = 1;
      }, 1000)

    },1000)
  }

  /**
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

 /**
  @param {}
  gets upload message which tracks progess
 */
 _closeFooter(){
   store.dispatch({type:'RESET_FOOTER_STORE', payload:{}})
 }
 /**
  @param {object} messageItem
  gets upload message which tracks progess
 */
 _removeMessage(messageItem){
    store.dispatch({
      type: 'REMOVE_MESSAGE',
      payload:{
        id: messageItem.id
      }
    })
 }


 render() {
     let footerClass = classNames({
       'Footer': true,
       'Footer--expand': (this.state.open || this.state.uploadOpen),
       'Footer--expand-extra': (this.state.open && this.state.uploadOpen)
      });

    let footerStatusClass = classNames({
        'Footer': !this.state.open,
        'Footer__status': this.state.open
    });

    let footerUploadClass = classNames({
        'hidden': !this.state.uploadOpen,
        'Footer__upload-status': this.state.uploadOpen
    });

    return (
      <div id="footer" className={footerClass}>

        <div
          className={footerStatusClass}>
            <div className="Footer__message">
              <ul className="Footer__message-list">
              {this.state.messageStack.map((messageItem)=>{
                  return(<li
                    key={messageItem.id}
                    className={messageItem.className}>
                    {messageItem.message}
                    <i
                      onClick={()=>{this._removeMessage(messageItem)}}
                      className="Footer__message-dismiss fa">
                    </i>
                  </li>)
              })}
              </ul>
            </div>
            <div
              onClick={() =>{ this._closeFooter() }}
              className="Footer__close"></div>
        </div>

        <div
          className={footerUploadClass}>
            <div className="Footer__messages">
              {this.state.uploadMessage}
            </div>

            <div
              id="footerProgressBar"
              style={{width: this.state.progessBarPercentage + '%'}}
              className={'Footer__progress-bar'}>
            </div>
        </div>


        {
          this.state.labbookSuccess &&
            <button
              className="Footer__button"
              onClick={() => this._openLabbook()}>
              Open LabBook
            </button>
        }

      </div>
    )
  }
}

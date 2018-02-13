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
    this._toggleMessagesList = this._toggleMessagesList.bind(this)
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

      this.setState(footer);//triggers re-render when store updates
    }

    footer.messageStack.forEach((messageItem)=>{
      const oneMinute = 60 * 1000
      if(!messageItem.error){
        setTimeout(()=>{
          this._removeMessage(messageItem)
        }, oneMinute)
      }
    })
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
  @param {}
  gets upload message which tracks progess
 */
 _closeFooter(){
   store.dispatch({type:'UPLOAD_MESSAGE_REMOVE',
   payload:
   {
     uploadMessage: '',
     id: '',
     progressBarPercentage: 0
   }
  })
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
 /**
  @param {boolean} value
  toggles messages list to collapsed or expanded
  @return {}
 */

 _toggleMessagesList(){
   store.dispatch({
     type: 'TOGGLE_MESSAGE_LIST',
     payload:{
       messageListOpen: !this.state.messageListOpen
     }
   })
 }


 render() {
     let footerClass = classNames({
       'Footer': true,
       'Footer--expand': (this.state.open || this.state.uploadOpen),
       'Footer--expand-extra': (this.state.open && this.state.uploadOpen)
      });

    let mostRecentMessage = this.state.messageStack[this.state.messageStack.length - 1]

    let statusClassType = '';

    this.state.messageStack.forEach((messageItem)=>{
      if(messageItem.className === "Footer__message--error"){
          statusClassType = "error"
      }else if((messageItem.className === "Footer__message--warning") && (statusClassType === '')){
          statusClassType = "warning"
      }
    })

    let footerStatusClass = classNames({
        'Footer': !this.state.open,
        'Footer__status': this.state.open,
        'Footer__status--error': (statusClassType === 'error'),
        'Footer__status--warning': (statusClassType === 'warning')
    });



    return (
      <div id="footer" className={footerClass}>

        <div
          className={footerStatusClass}>
          { mostRecentMessage &&

            <MainStatusMessage
              mostRecentMessage={mostRecentMessage}
              self={this}
            />
          }

          <ListStatusMessages
            self={this}
          />

        </div>

        <FooterUpload
          self={this}
        />

      </div>
    )
  }
}


const MainStatusMessage = ({mostRecentMessage, self}) =>{
  let otherMessages = self.state.messageStack.length - 1;
  let footerExpandMessages = classNames({
    'Footer__expand-messages-button': true,
    'Footer__expand-messages-button--expanded': self.state.messageListOpen
  })
  return (
    <div
      key={mostRecentMessage.id}
      className="Footer__main-message">
      <div className="Footer__main-message-text">
        {mostRecentMessage.message}
      </div>
      {
        (otherMessages > 0) &&
        <div
          className={footerExpandMessages}
          onClick={()=>{self._toggleMessagesList()}}>
          {` (and ${otherMessages} other notifications)`}
        </div>
      }

      {mostRecentMessage.error &&
        <i
          onClick={()=>{self._removeMessage(mostRecentMessage)}}
          className="Footer__message-dismiss fa">
        </i>
      }

    </div>
  )
}

let ListStatusMessages = ({self}) =>{

  let footerMessageListClass = classNames({
      'Footer__message-list': true,
      'Footer__message-list--collapsed': !self.state.messageListOpen
    })

  let mostRecentMessage = self.state.messageStack[self.state.messageStack.length - 1]
  let messageList = self.state.messageStack.filter((messageItem)=>{
    return (mostRecentMessage.id !== messageItem.id)
  })
  return (
    <div className="Footer__messages-section">
      <div className={footerMessageListClass}>

        <ul>
          {messageList.map((messageItem)=>{

              return(<li
                key={messageItem.id}
                className={messageItem.className}>
                <p className="Footer__message-title">{messageItem.message}</p>

                {messageItem.error &&
                  <i
                    onClick={()=>{self._removeMessage(messageItem)}}
                    className="Footer__message-dismiss fa">
                  </i>
                }

              </li>)
          })}
          </ul>
      </div>

    </div>
  )
}

const FooterUpload = ({self}) => {

  let footerUploadClass = classNames({
      'hidden': !self.state.uploadOpen,
      'Footer__upload-status': self.state.uploadOpen,
      'Footer__upload-error': self.state.uploadError
  });
  return(
    <div
      className={footerUploadClass}>
        <div className="Footer__upload-message">
          {self.state.uploadMessage}
        </div>

        <div
          id="footerProgressBar"
          style={{width: self.state.progessBarPercentage + '%'}}
          className="Footer__progress-bar">
        </div>
        {
          self.state.uploadError &&
            <div
              onClick={() =>{ self._closeFooter() }}
              className="Footer__close">
            </div>
        }
        {
          self.state.labbookSuccess &&
            <button
              className="Footer__button"
              onClick={() => self._openLabbook()}>
              Open LabBook
            </button>
        }
    </div>
  )
}

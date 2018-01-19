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

 _toggleMessagesList(value){
   store.dispatch({
     type: 'TOGGLE_MESSAGE_LIST',
     payload:{
       messageListOpen: value
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
        'Footer__upload-status': this.state.uploadOpen,
        'Footer__upload-error': this.state.uploadError
    });

    let footerMessageListClass = classNames({
        'Footer__message-list': true,
        'Footer__message-list--collapsed': !this.state.messageListOpen
      })
    let footerCollapseButton = classNames({
      'Footer__collapse-message-list': this.state.messageListOpen,
      'hidden': !this.state.messageListOpen
    })


    let mostRecentMessage = this.state.messageStack[this.state.messageStack.length - 1]
    let messageList = this.state.messageStack.filter((messageItem)=>{
      return (mostRecentMessage.id !== messageItem.id)
    })

    let otherMessages = this.state.messageStack.length - 1
    return (
      <div id="footer" className={footerClass}>

        <div
          className={footerStatusClass}>

            <div className="Footer__messages-section">
              <div className={footerMessageListClass}>
                <div
                  className={footerCollapseButton}
                  onClick={()=>{this._toggleMessagesList(false)}}>
                </div>
                <ul>
                  {messageList.map((messageItem)=>{

                      return(<li
                        key={messageItem.id}
                        className={messageItem.className}>
                        {messageItem.message}

                        {messageItem.error &&
                          <i
                            onClick={()=>{this._removeMessage(messageItem)}}
                            className="Footer__message-dismiss fa">
                          </i>
                        }

                      </li>)
                  })}
                  </ul>
              </div>

              { mostRecentMessage &&
                <div
                  key={mostRecentMessage.id}
                  className={mostRecentMessage.className}>
                  {mostRecentMessage.message}

                  {mostRecentMessage.error &&
                    <i
                      onClick={()=>{this._removeMessage(mostRecentMessage)}}
                      className="Footer__message-dismiss fa">
                    </i>
                  }

                  {
                    (otherMessages > 0) &&
                    <span
                      className="Footer__expand-messages-button"
                      onClick={()=>{this._toggleMessagesList(true)}}>
                      {` and ${otherMessages} other message(s)`}
                    </span>
                  }

                </div>
              }



            </div>

        </div>

        <div
          className={footerUploadClass}>
            <div className="Footer__upload-message">
              {this.state.uploadMessage}
            </div>

            <div
              id="footerProgressBar"
              style={{width: this.state.progessBarPercentage + '%'}}
              className="Footer__progress-bar">
            </div>
            {
              this.state.uploadError &&
                <div
                  onClick={() =>{ this._closeFooter() }}
                  className="Footer__close">
                </div>
            }
            {
              this.state.labbookSuccess &&
                <button
                  className="Footer__button"
                  onClick={() => this._openLabbook()}>
                  Open LabBook
                </button>
            }
        </div>

      </div>
    )
  }
}

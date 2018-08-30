//vendor
import React, { Component } from 'react'
import classNames from 'classnames'
import Moment from 'moment'

//store
import store from 'JS/redux/store'


export default class FooterNotificationList extends Component {

  _toggleViewHistory(){
    store.dispatch({
      type: 'UPDATE_HISTORY_VIEW',
      payload: {}
    })
  }

  render() {

    let messageList = this.props.parentState.viewHistory ? this.props.parentState.messageStackHistory : this.props.parentState.messageStack;

    let messageListOpenItems = messageList.filter((message) => {
        return message.messageBodyOpen
    })

    let footerMessageSectionClass = classNames({
        'Footer__messages-section': true,
        'Footer__messages-section--collapsed': !this.props.parentState.messageListOpen,
        'Footer__message-section--helper-open': this.props.parentState.helperVisible
    })

    let footerMessageListClass = classNames({
        'Footer__message-list': true,
        'Footer__message-list--collapsed': !this.props.parentState.messageListOpen,
    })

    let viewAllButtonClass = classNames({
        'Footer__button--view-all': true,
        'hidden': (this.props.parentState.viewHistory || !this.props.parentState.messageListOpen)
    })

    let height = messageList.length > 6 ?  260 : messageList.length * 60;
    height = messageListOpenItems.length > 0 ?  document.body.clientHeight - 200 : height;


    return (
      <div className={footerMessageSectionClass}>
        <div
          className={viewAllButtonClass}
          onClick={()=> this._toggleViewHistory()}
        >
          View All
        </div>
        <div className={footerMessageListClass} style={{height: `${height}px`}}>

          <ul>
            {
              messageList.map((messageItem, index)=>{
                const messageBodyClasses = classNames({
                  'Footer__message-body-content': true,
                  'hidden': !messageItem.messageBodyOpen
                })

                const toggleButton = classNames({
                  'Footer__button--toggle': true,
                  'open': messageItem.messageBodyOpen
                })

                const bodyCSS = classNames({
                  'Footer__body-height': messageItem.messageBodyOpen,
                  [messageItem.className]: true
                })
                return(
                  <li
                    key={messageItem.id + index}
                    className={bodyCSS}>
                    <div className="Footer__message-body">
                      <div className="Footer__flex-container">
                        <div className="Footer__message-icon"></div>

                        <div className="Footer__message-time">{Moment(messageItem.date).fromNow()}</div>
                        <div className="Footer__message-item">
                          <p className="Footer__message-title">
                            {messageItem.message}
                          </p>
                        </div>

                        { (messageItem.messageBody.length > 0) &&
                          <div className="Footer__message-expand">
                            <div
                              className={toggleButton}
                              onClick={()=>{this.props.showMessageBody(index)}}>

                            </div>
                          </div>

                        }
                      </div>

                      <div className={messageBodyClasses}>

                        <ul>
                          {
                            messageItem.messageBody && messageItem.messageBody.map((item, index)=> {

                              return(
                                <li
                                  key={messageItem.id + index}>
                                  <div className="Footer__message-body-content--text" dangerouslySetInnerHTML={{__html: item.message}}>

                                  </div>
                                </li>)
                            })
                          }
                        </ul>
                      </div>
                    </div>

                  </li>)
                })
              }

              {
                  (messageList.length === 0) &&

                  <li

                    className="Footer__message">
                    <div className="Footer__message-body">
                      <div className="Footer__flex-container">

                        <div className="Footer__message-item">
                          <p className="Footer__message-title">
                            No Notifications
                          </p>
                        </div>
                      </div>
                     </div>
                   </li>
               }

            </ul>
        </div>
      </div>
    )
  }
}

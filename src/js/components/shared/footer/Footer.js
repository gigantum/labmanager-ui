import React, {Component} from 'react'
import classNames from 'classnames'
//components
import FooterNotificationList from './FooterNotificationList'
import FooterUploadBar from './FooterUploadBar'
//store
import store from "JS/redux/store"

let unsubscribe

export default class Footer extends Component {

  constructor(props) {
    super(props)

    this.state = store.getState().footer

    this._clearState = this._clearState.bind(this)
    this._toggleMessageList = this._toggleMessageList.bind(this)
    this._showMessageBody = this._showMessageBody.bind(this)
    this._resize = this._resize.bind(this)
  }
  /**
    subscribe to store to update state
  */
  componentDidMount() {

    unsubscribe = store.subscribe(() => {

      this.storeDidUpdate(store.getState().footer)
    })

    window.addEventListener("resize", this._resize);

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
    if (footerString !== stateString) {
      //console.log(footer)
      this.setState(footer); //triggers re-render when store updates
    }

    footer.messageStack.forEach((messageItem) => {
      const timeInSeconds = 15 * 1000
      if (!messageItem.error) {

        if (!messageItem.isMultiPart || (messageItem.isMultiPart && messageItem.isLast)) {

          setTimeout(() => {

            //this._removeMessage(messageItem)
          }, timeInSeconds)
        }
      }
    })
  }

  _openLabbook() {
    this._clearState()
    this.props.history.replace(`/projects/${this.state.labbookName}`)
  }
  /**
    @param {}
    add scroll listener to pop up footer
  */
  _clearState() {

    document.getElementById('footerProgressBar').style.opacity = 0;

    store.dispatch({type: 'RESET_FOOTER_STORE', payload: {}})

    setTimeout(() => {
      document.getElementById('footerProgressBar').style.width = "0%";
      setTimeout(() => {
        document.getElementById('footerProgressBar').style.opacity = 1;
      }, 1000)

    }, 1000)
  }

  /**
   @param {}
   stops user and pops a modal prompting them to cancel continue or save changes
  */
  _pauseUpload() {
    store.dispatch({
      type: 'PAUSE_UPLOAD',
      payload: {
        pause: true
      }
    })
  }
  /**
  @param {}
  gets upload message which tracks progess
 */
  _closeFooter() {
    store.dispatch({
      type: 'UPLOAD_MESSAGE_REMOVE',
      payload: {
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
  _removeMessage(messageItem) {
    store.dispatch({
      type: 'REMOVE_MESSAGE',
      payload: {
        id: messageItem.id
      }
    })
  }
  /**
  @param {boolean} value
  toggles messages list to collapsed or expanded
  updates redux store
  @return {}
 */

  _toggleMessageList() {
    if(this.state.messageStackHistory.length > 0){
      store.dispatch({
        type: 'TOGGLE_MESSAGE_LIST',
        payload: {
          messageListOpen: !this.state.messageListOpen,
          viewHistory: true
        }
      })
    }
  }
  /**
  @param {Int}
  toggles view of message body for a stack item
  updates redux store
  @return {}
 */
  _showMessageBody(index) {

      store.dispatch({
        type: !this.state.viewHistory
        ? 'UPDATE_MESSAGE_STACK_ITEM_VISIBILITY'
        : 'UPDATE_HISTORY_STACK_ITEM_VISIBILITY',
        payload: {
            index
        }
      })
  }
  /**
    * @param {}
    * update store to risize component
  */
  _resize(){
    store.dispatch({
      type: 'RESIZE_FOOTER',
      payload: {}
    })
  }

  render() {

    let bodyWidth = document.body.clientWidth;

    let footerClass = classNames({
      'Footer': true,
      'Footer--expand': (this.state.open || this.state.uploadOpen),
      'Footer--expand-extra': (this.state.open && this.state.uploadOpen)
    });

    let footerButtonClass = classNames({
      'Footer__disc-button': true,
      'Footer__disc-button--open': this.state.messageListOpen,
      'Footer__dist-button--side-view': bodyWidth < 1600
    });





    return (<div className="Footer__container">
      <div id="footer" className={footerClass}>



        <FooterNotificationList
          showMessageBody={this._showMessageBody}
          removeMessage={this._removeMessage}
          parentState={this.state}
        />

        <FooterUploadBar
          closeFooter={this._closeFooter}
          openLabbook={this._openLabbook}
          parentState={this.state}
        />

        <div
          onClick={() => this._toggleMessageList()}
          className={footerButtonClass}>
        </div>

      </div>
    </div>)
  }
}

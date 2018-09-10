import React, {Component} from 'react'
import classNames from 'classnames'
//components
import FooterNotificationList from './FooterNotificationList'
import FooterUploadBar from './FooterUploadBar'
import { connect } from 'react-redux'
//store
import store from "JS/redux/store"

class Footer extends Component {

  constructor(props) {
    super(props)

    this._clearState = this._clearState.bind(this)
    this._toggleMessageList = this._toggleMessageList.bind(this)
    this._showMessageBody = this._showMessageBody.bind(this)
    this._resize = this._resize.bind(this)
    this._openLabbook = this._openLabbook.bind(this)
  }
  /**
    subscribe to store to update state
  */
  componentDidMount() {

    window.addEventListener("resize", this._resize);

  }
  /**
    unsubscribe from event listeners
  */
  componentWillUnmount() {
    window.removeEventListener("resize", this._resize);

  }
  /**
   hides messages in stack after 15 seconds
  */
  componentDidUpdate(){
    this.props.messageStack.forEach((messageItem) => {
      const timeInSeconds = 15 * 1000
      if (!messageItem.error) {

        if (!messageItem.isMultiPart || (messageItem.isMultiPart && messageItem.isLast)) {

          setTimeout(() => {

            this._removeMessage(messageItem)
          }, timeInSeconds)
        }
      }
    })
  }

  _openLabbook() {
    this._clearState()
    this.props.history.replace(`/projects/${this.props.labbookName}`)
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
  @param {}
  toggles messages list to collapsed or expanded
  updates redux store
  @return {}
 */

  _toggleMessageList() {

      store.dispatch({
        type: 'TOGGLE_MESSAGE_LIST',
        payload: {
          messageListOpen: !this.props.messageListOpen,
          viewHistory: true
        }
      })

  }
  /**
  @param {Int}
  toggles view of message body for a stack item
  updates redux store
  @return {}
 */
  _showMessageBody(index) {

      store.dispatch({
        type: !this.props.viewHistory
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
      'Footer--expand': (this.props.open) || this.props.uploadOpen,
      'Footer--expand-extra': (this.props.open && this.props.uploadOpen)
    });

    let footerButtonClass = classNames({
      'Footer__disc-button': true,
      'Footer__disc-button--open': this.props.messageListOpen,
      'Footer__dist-button--side-view': bodyWidth < 1600,
      'Footer__disc-button--helper-open': this.props.helperVisible,
      'Footer__disc-button--bottom': !this.props.messageListOpen && this.props.uploadOpen
    });


    return (
      <div className="Footer__container">
        <div id="footer" className={footerClass}>

          <FooterNotificationList
            showMessageBody={this._showMessageBody}
            parentState={this.props}
          />

          <FooterUploadBar
            closeFooter={this._closeFooter}
            openLabbook={this._openLabbook}
            parentState={this.props}
          />

          <div
            onClick={() => this._toggleMessageList()}
            className={footerButtonClass}>
          </div>

      </div>
    </div>)
  }
}

const mapStateToProps = (state, ownProps) => {
  return state.footer
}

const mapDispatchToProps = dispatch => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Footer);

import React, { Component } from 'react';
import classNames from 'classnames';
// components
import FooterNotificationList from './FooterNotificationList';
import FooterUploadBar from './FooterUploadBar';
import { connect } from 'react-redux';
// store
import {
  setUpdateMessageStackItemVisibility,
  setUpdateHistoryStackItemVisibility,
  setResizeFooter,
  setUploadMessageRemove,
  setResetFooter,
  setRemoveMessage,
  setToggleMessageList,
} from 'JS/redux/reducers/footer';
import { setPauseUpload } from 'JS/redux/reducers/labbook/fileBrowser/fileBrowserWrapper';


class Footer extends Component {
  constructor(props) {
    super(props);

    this._clearState = this._clearState.bind(this);
    this._toggleMessageList = this._toggleMessageList.bind(this);
    this._showMessageBody = this._showMessageBody.bind(this);
    this._resize = this._resize.bind(this);
    this._openLabbook = this._openLabbook.bind(this);
  }
  /**
    subscribe to store to update state
  */
  componentDidMount() {
    window.addEventListener('resize', this._resize);
  }
  /**
    unsubscribe from event listeners
  */
  componentWillUnmount() {
    window.removeEventListener('resize', this._resize);
  }
  /**
   hides messages in stack after 15 seconds
  */
  componentDidUpdate() {
    this.props.messageStack.forEach((messageItem) => {
      const timeInSeconds = 15 * 1000;
      if (!messageItem.error) {
        if (!messageItem.isMultiPart || (messageItem.isMultiPart && messageItem.isLast)) {
          setTimeout(() => {
            this._removeMessage(messageItem);
          }, timeInSeconds);
        }
      }
    });
  }

  _openLabbook() {
    this._clearState();
    this.props.history.replace(`/projects/${this.props.labbookName}`);
  }
  /**
    @param {}
    add scroll listener to pop up footer
  */
  _clearState() {
    document.getElementById('footerProgressBar').style.opacity = 0;
    this.props.setResetFooter();

    setTimeout(() => {
      document.getElementById('footerProgressBar').style.width = '0%';
      setTimeout(() => {
        document.getElementById('footerProgressBar').style.opacity = 1;
      }, 1000);
    }, 1000);
  }

  /**
   @param {}
   stops user and pops a modal prompting them to cancel continue or save changes
  */
  _pauseUpload() {
    setPauseUpload(true);
  }
  /**
  @param {}
  gets upload message which tracks progess
 */
  _closeFooter() {
    this.props.setUploadMessageRemove('', '', 0);
  }
  /**
  @param {object} messageItem
  gets upload message which tracks progess
 */
  _removeMessage(messageItem) {
    setRemoveMessage(messageItem.id);
  }
  /**
  @param {}
  toggles messages list to collapsed or expanded
  updates redux store
  @return {}
 */

  _toggleMessageList() {
    this.props.setToggleMessageList(!this.props.messageListOpen, true);
  }
  /**
  @param {Int}
  toggles view of message body for a stack item
  updates redux store
  @return {}
 */
  _showMessageBody(index) {
    if (!this.props.viewHistory) {
      this.props.setUpdateMessageStackItemVisibility(index);
    } else {
      this.props.setUpdateHistoryStackItemVisibility(index);
    }
  }
  /**
    * @param {}
    * update store to risize component
  */
  _resize() {
    this.props.setResizeFooter();
  }

  render() {
    const bodyWidth = document.body.clientWidth;

    const footerClass = classNames({
      Footer: true,
      'Footer--expand': (this.props.open) || this.props.uploadOpen,
      'Footer--expand-extra': (this.props.open && this.props.uploadOpen),
    });

    const footerButtonClass = classNames({
      'Footer__disc-button': true,
      'Footer__disc-button--open': this.props.messageListOpen,
      'Footer__dist-button--side-view': bodyWidth < 1600,
      'Footer__disc-button--helper-open': this.props.helperVisible,
      'Footer__disc-button--bottom': !this.props.messageListOpen && this.props.uploadOpen,
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
            className={footerButtonClass}
          />

        </div>
      </div>);
  }
}

const mapStateToProps = (state, ownProps) => state.footer;

const mapDispatchToProps = dispatch => ({
  setUpdateMessageStackItemVisibility,
  setUpdateHistoryStackItemVisibility,
  setResizeFooter,
  setUploadMessageRemove,
  setResetFooter,
  setRemoveMessage,
  setToggleMessageList,
});

export default connect(mapStateToProps, mapDispatchToProps)(Footer);

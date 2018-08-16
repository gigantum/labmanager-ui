import React, { Component } from 'react'
import classNames from 'classnames'


export default class FooterUploadBar extends Component {

  render() {


    let footerUploadClass = classNames({
      'hidden': !this.props.parentState.uploadOpen,
      'Footer__upload-status': this.props.parentState.uploadOpen,
      'Footer__upload-error': this.props.parentState.uploadError
    });

    return (
      <div className={footerUploadClass}>
        <div className="Footer__upload-message">
          {this.props.parentState.uploadMessage}
        </div>

        <div id="footerProgressBar" style={{
            width: this.props.parentState.progessBarPercentage + '%'
          }} className="Footer__progress-bar"></div>

        {/* <button // commented out until backend bugs are fixed
              onClick={() =>{ self._pauseUpload() }}
              className="Footer__button Footer__button--cancel">
              Cancel
            </button> */
        }
        {
          this.props.parentState.uploadError && <div onClick={() => {
                this.props._closeFooter()
              }} className="Footer__close"></div>
        }
        {
          this.props.parentState.labbookSuccess && <button className="Footer__button" onClick={() => this.props.openLabbook()}>
              Open Project
            </button>
        }
      </div>
    )
  }
}

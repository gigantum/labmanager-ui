// vendor
import React, { Component } from 'react';
import classNames from 'classnames';

export default class ButtonLoader extends Component {
  constructor(props) {
  	super(props);
  	this.state = {};

    this._clickCallback = this._clickCallback.bind(this);
  }

  /** **
   * @param {object, object}
   * checks button state
   * passes back to callback
   * return {}
   ***** */
  _clickCallback(evt, params) {
    this.props.clicked(evt, params);
  }

  render() {
    const {
      buttonState,
      buttonText,
      buttonDisabled,
      params,
    } = this.props;

    const buttonLoaderCSS = classNames({
      ButtonLoader: true,
      [`ButtonLoader--${buttonState}`]: buttonState !== '',
      [this.props.className]: (this.props.className !== null),
    });

    const buttonTestToDisplay = buttonState !== 'finished' ? buttonText : '✓';

    return (
      <button
        disabled={buttonState !== '' || buttonDisabled}
        className={buttonLoaderCSS}
        onClick={(evt => this.props.clicked(evt, params))}
      >

        {buttonTestToDisplay}

      </button>
    );
  }
}

//vendor
import React, { Component } from 'react'
import classNames from 'classnames'

export default class ButtonLoader extends Component {

  render() {

    const {
      buttonState,
      buttonText,
      buttonDisabled,
      params
    } = this.props

    const buttonLoaderCSS = classNames({
      'ButtonLoader': true,
      [`ButtonLoader--${buttonState}`]:  buttonState !== '',
      [this.props.className]: (this.props.className !== null)
    })

    let buttonTestToDisplay = buttonState !== 'finished' ? buttonText : '✓'

    return (
      <button
        disabled={buttonDisabled}
        className={buttonLoaderCSS}
        onClick={(evt) => this.props.clicked(evt, params)}>

        {buttonTestToDisplay}

      </button>
    )
  }
}

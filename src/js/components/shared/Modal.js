//vendor
import React, { Component, Fragment } from 'react'
import classNames from 'classnames'

export default class Modal extends Component {

  componentDidMount(){
    document.getElementById('root').classList.add('no-overflow')
  }
  componentWillUnmount(){
    document.getElementById('root').classList.remove('no-overflow')

  }

  render() {
    let modelContentCSS = classNames({
      'Modal__content': true,
      [this.props.size]: this.props.size, //large, medium, small
      [this.props.icon]: this.props.icon
    })
    return (
      <div className="Modal">

        <div className="Modal__cover"></div>

        <div className={modelContentCSS}>
          {
            this.props.handleClose &&
            <div
              className="Modal__close"
              onClick={()=> this.props.handleClose()}
            >
            </div>
          }
          <div className="Modal__container">
            {
              this.props.preHeader &&
              <p className="Modal__pre-header">{this.props.preHeader}</p>
            }
            {
              this.props.header &&
              <Fragment>
                <h4 className="Modal__header">{this.props.header}</h4>
                <hr></hr>
              </Fragment>
            }
            <div className="Modal__sub-container">
              {
                this.props.renderContent()
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}

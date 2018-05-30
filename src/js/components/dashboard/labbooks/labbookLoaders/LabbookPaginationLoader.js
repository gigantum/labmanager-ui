//vendor
import React, { Component } from 'react'
import classNames from 'classnames'

export default class remoteLabbooksPaginationLoader extends Component {
  render(){
    let PaginationLoaderCSS = classNames({
      [`LocalLabbooks__panel column-4-span-3 flex flex--column justify--space-between Labbook-paginating Labbook-paginating__loader--${this.props.index}`]: this.props.isLoadingMore,
      'Labbook__loader-hidden': !this.props.isLoadingMore,
    })

    return(
      <div
        key={`Labbooks-loader-card`}
        className={PaginationLoaderCSS}>
        <div></div>
      </div>
    )
  }
}

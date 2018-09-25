// vendor
import React, { Component } from 'react';
import classNames from 'classnames';

export default class PaginationLoader extends Component {
  render() {
    const PaginationLoaderCSS = classNames({
      [`ActivityCard ActivityCard__loader ActivityCard__loader--${this.props.index} card`]: this.props.isLoadingMore,
      'ActivityCard ActivityCard__loader-hidden': !this.props.isLoadingMore,
      'column-1-span-10': true,
    });

    return (
      <div
        key={`Activity-loader-card-${this.props.index}`}
        className={PaginationLoaderCSS}
      />
    );
  }
}

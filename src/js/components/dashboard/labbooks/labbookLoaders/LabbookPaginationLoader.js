// vendor
import React, { Component } from 'react';
import classNames from 'classnames';
// assets
import './LabbookPaginationLoader.scss';

export default class LabbookPaginationLoader extends Component {
  render() {
    const PaginationLoaderCSS = classNames({
      [`Card column-4-span-3 flex flex--column justify--space-between LabbookPaginationLoader LabbookPaginationLoader--${this.props.index}`]: this.props.isLoadingMore,
      'LabbookPaginationLoader--hidden': !this.props.isLoadingMore,
    });

    return (
      <div
        key="Labbooks-loader-card"
        className={PaginationLoaderCSS}
      >
        <div />
      </div>
    );
  }
}

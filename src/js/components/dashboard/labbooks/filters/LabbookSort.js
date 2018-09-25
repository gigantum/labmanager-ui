// vendor
import React, { Component } from 'react';
import classNames from 'classnames';
// assets
import './LabbookSort.scss';


class LabbookSort extends Component {
  state = {
    sortMenuOpen: false,
  }

  /**
    *  @param {}
    *  gets orderBy and sort value and displays it to the UI more clearly
    *  @return{}
  */
  _getSelectedSort() {
    if (this.props.orderBy === 'modified_on') {
      return `Modified Date ${this.props.sort === 'asc' ? '(Oldest)' : '(Newest)'}`;
    } else if (this.props.orderBy === 'created_on') {
      return `Creation Date ${this.props.sort === 'asc' ? '(Oldest)' : '(Newest)'}`;
    }

    return this.props.sort === 'asc' ? 'A-Z' : 'Z-A';
  }

  /**
    *  @param {}
    *  update sort menu
    *  @return {}
  */
  _toggleSortMenu() {
    this.setState({ sortMenuOpen: !this.state.sortMenuOpen });
  }

  render() {
    const { props, state } = this;

    const labbookSortSeclectorCSS = classNames({
      LabbookSort__selector: true,
      'LabbookSort__selector--open': state.sortMenuOpen,
      'LabbookSort__selector--collapsed': !state.sortMenuOpen,
    });

    const labbookSortMenuCSS = classNames({
      'LabbookSort__menu box-shadow': true,
      hidden: !state.sortMenuOpen,
    });

    return (

      <div className="LabbookSort">
        Sort by:

        <span
          className={labbookSortSeclectorCSS}
          onClick={() => this._toggleSortMenu()}
        >
          {this._getSelectedSort()}
        </span>

        <ul className={labbookSortMenuCSS}>

          <li
            className="LabbookSort__list-item"
            onClick={() => props.setSortFilter('modified_on', 'desc')}
          >
            Modified Date (Newest) {state.orderBy === 'modified_on' && state.sort !== 'asc' ? '✓ ' : ''}
          </li>

          <li
            className="LabbookSort__list-item"
            onClick={() => props.setSortFilter('modified_on', 'asc')}
          >
            Modified Date (Oldest) {state.orderBy === 'modified_on' && state.sort === 'asc' ? '✓ ' : ''}
          </li>

          <li
            className="LabbookSort__list-item"
            onClick={() => props.setSortFilter('created_on', 'desc')}
          >
            Creation Date (Newest) {state.orderBy === 'created_on' && state.sort !== 'asc' ? '✓ ' : ''}
          </li>

          <li
            className="LabbookSort__list-item"
            onClick={() => props.setSortFilter('created_on', 'asc')}
          >
            Creation Date (Oldest) {state.orderBy === 'created_on' && state.sort === 'asc' ? '✓ ' : ''}
          </li>

          <li
            className="LabbookSort__list-item"
            onClick={() => props.setSortFilter('name', 'asc')}
          >
            A-Z {state.orderBy === 'name' && state.sort === 'asc' ? '✓ ' : ''}
          </li>

          <li
            className="LabbookSort__list-item"
            onClick={() => props.setSortFilter('name', 'desc')}
          >
            Z-A {this.state.orderBy === 'name' && this.state.sort !== 'asc' ? '✓ ' : ''}
          </li>

        </ul>

      </div>);
  }
}

export default LabbookSort;

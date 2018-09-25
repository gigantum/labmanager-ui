// vendor
import React, { Component } from 'react';
import classNames from 'classnames';
// assets
import './LabbookFilterBy.scss';


class LabbookFilterBy extends Component {
  state = {
    filterMenuOpen: false,
  }

  /**
    *  @param {}
    *  gets filter value and displays it to the UI more clearly
  */
  _getFilter() {
    switch (this.props.filter) {
      case 'all':
        return 'All';
      case 'owner':
        return 'My Projects';
      case 'others':
        return 'Shared With Me';
      default:
        return this.props.filter;
    }
  }

  /**
    *  @param {}
    *  update sort menu
    *  @return {}
  */
  _toggleFilterMenu() {
    this.setState({ filterMenuOpen: !this.state.filterMenuOpen });
  }

  render() {
    const { props, state } = this;

    const labbookFilterSeclectorCSS = classNames({
      LabbookFilterBy__selector: true,
      'LabbookFilterBy__selector--open': state.filterMenuOpen,
      'LabbookFilterBy__selector--collapsed': !state.filterMenuOpen,
    });

    const labbookFilterMenuCSS = classNames({
      'LabbookFilterBy__menu box-shadow': true,
      hidden: !state.filterMenuOpen,
    });

    return (

      <div className="LabbookFilterBy">
        Filter by:
        <span
          className={labbookFilterSeclectorCSS}
          onClick={() => this._toggleFilterMenu()}
        >
          {this._getFilter()}
        </span>
        <ul
          className={labbookFilterMenuCSS}
        >
          <li
            className="LabbookFilterBy__list-item"
            onClick={() => props.setFilter('all')}
          >
            All {props.filter === 'all' ? '✓ ' : ''}
          </li>
          <li
            className="LabbookFilterBy__list-item"
            onClick={() => props.setFilter('owner')}
          >
           My Projects {props.filter === 'owner' ? '✓ ' : ''}
          </li>
          <li
            className="LabbookFilterBy__list-item"
            onClick={() => props.setFilter('others')}
          >
            Shared with me {props.filter === 'others' ? '✓ ' : ''}
          </li>
        </ul>
      </div>);
  }
}

export default LabbookFilterBy;

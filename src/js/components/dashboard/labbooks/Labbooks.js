// vendor
import React, { Component, Fragment } from 'react';
import queryString from 'querystring';
import classNames from 'classnames';
import { connect } from 'react-redux';
// components
import WizardModal from 'Components/wizard/WizardModal';
import Loader from 'Components/shared/Loader';
import LocalLabbooksContainer, { LocalLabbooks } from 'Components/dashboard/labbooks/localLabbooks/LocalLabbooks';
import RemoteLabbooks from 'Components/dashboard/labbooks/remoteLabbooks/RemoteLabbooks';
import LoginPrompt from 'Components/labbook/labbookHeader/branchMenu/modals/LoginPrompt';
import ToolTip from 'Components/shared/ToolTip';
import LabbookFilterBy from './filters/LabbookFilterBy';
import LabbookSort from './filters/LabbookSort';
// utils
import Validation from 'JS/utils/Validation';
// queries
import UserIdentity from 'JS/Auth/UserIdentity';
// config
import config from 'JS/config';
// store
import { setErrorMessage } from 'JS/redux/reducers/footer';
import { setFilterText } from 'JS/redux/reducers/labbookListing/labbookListing';
// assets
import './Labbooks.scss';

class Labbooks extends Component {
  constructor(props) {
    super(props);

    const {
      filter,
      orderBy,
      sort,
    } = queryString.parse(this.props.history.location.search.slice(1));

    this.state = {
      labbookModalVisible: false,
      oldLabbookName: '',
      newLabbookName: '',
      renameError: '',
      showNamingError: false,
      filter: filter || 'all',
      sortMenuOpen: false,
      refetchLoading: false,
      selectedSection: 'local',
      showLoginPrompt: false,
      orderBy: orderBy || 'modified_on',
      sort: sort || 'desc',
      filterMenuOpen: false,
    };

    this._closeSortMenu = this._closeSortMenu.bind(this);
    this._closeFilterMenu = this._closeFilterMenu.bind(this);
    this._goToLabbook = this._goToLabbook.bind(this);
    this._showModal = this._showModal.bind(this);
    this._filterSearch = this._filterSearch.bind(this);
    this._setSortFilter = this._setSortFilter.bind(this);
    this._closeLoginPromptModal = this._closeLoginPromptModal.bind(this);
    this._filterLabbooks = this._filterLabbooks.bind(this);
    this._setFilter = this._setFilter.bind(this);
    this._changeSearchParam = this._changeSearchParam.bind(this);
    this._hideSearchClear = this._hideSearchClear.bind(this);
    this._setFilterValue = this._setFilterValue.bind(this);
  }

  /**
    * @param {}
    * subscribe to store to update state
    * set unsubcribe for store
  */
  UNSAFE_componentWillMount() {
    const paths = this.props.history.location.pathname.split('/');
    let sectionRoute = paths.length > 2 ? paths[2] : 'local';

    if (paths[2] !== 'cloud' && paths[2] !== 'local') {
      sectionRoute = 'local';
    }

    this.setState({ selectedSection: sectionRoute });

    document.title = 'Gigantum';

    window.addEventListener('click', this._closeSortMenu);
    window.addEventListener('click', this._closeFilterMenu);
  }

  /**
    * @param {}
    * fires when component unmounts
    * removes added event listeners
  */
  componentWillUnmount() {
    window.removeEventListener('click', this._closeSortMenu);
    window.removeEventListener('click', this._closeFilterMenu);
    window.removeEventListener('scroll', this._captureScroll);
    window.removeEventListener('click', this._hideSearchClear);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const paths = nextProps.history.location.pathname.split('/');
    const sectionRoute = paths.length > 2 ? paths[2] : 'local';

    if (paths[2] !== 'cloud' && paths[2] !== 'local') {
      this.props.history.replace('../../../../projects/local');
    }
    this.setState({ selectedSection: sectionRoute });
  }

  /**
    * @param {}
    * fires when user identity returns invalid session
    * prompts user to revalidate their session
  */
  _closeLoginPromptModal() {
    this.setState({
      showLoginPrompt: false,
    });
  }

  /**
    * @param {event} evt
    * fires when sort menu is open and the user clicks elsewhere
    * hides the sort menu dropdown from the view
  */

  _closeSortMenu(evt) {
    const isSortMenu = evt && evt.target && evt.target.className && (evt.target.className.indexOf('Labbooks__sort') > -1);

    if (!isSortMenu && this.state.sortMenuOpen) {
      this.setState({ sortMenuOpen: false });
    }
  }

  /**
    * @param {event} evt
    * fires when filter menu is open and the user clicks elsewhere
    * hides the filter menu dropdown from the view
  */
  _closeFilterMenu(evt) {
    const isFilterMenu = evt.target.className.indexOf('Labbooks__filter') > -1;

    if (!isFilterMenu && this.state.filterMenuOpen) {
      this.setState({ filterMenuOpen: false });
    }
  }


  /**
    * @param {}
    * fires when a componet mounts
    * adds a scoll listener to trigger pagination
  */
  componentDidMount() {
    window.addEventListener('scroll', this._captureScroll);
    window.addEventListener('click', this._hideSearchClear);
  }

  /**
    * @param {}
    * fires on window clock
    * hides search cancel button when clicked off
  */
  _hideSearchClear(evt) {
    if (this.state.showSearchCancel && evt.target.className !== 'Labbooks__search-cancel' && evt.target.className !== 'Labbooks__search no--margin') {
      this.setState({ showSearchCancel: false });
    }
  }

  /**
    *  @param {string} labbookName - inputs a labbook name
    *  routes to that labbook
  */
  _goToLabbook = (labbookName, owner) => {
    this.setState({ labbookName, owner });
  }


  /**
    *  @param {string} labbookName
    *  closes labbook modal and resets state to initial state
  */
  _closeLabbook(labbookName) {
    this.setState({
      labbookModalVisible: false,
      oldLabbookName: '',
      newLabbookName: '',
      showNamingError: false,
    });
  }

  /**
    *  @param {event} evt
    *  sets new labbook title to state
  */
  _setLabbookTitle(evt) {
    const isValid = Validation.labbookName(evt.target.value);
    if (isValid) {
      this.setState({
        newLabbookName: evt.target.value,
        showNamingError: false,
      });
    } else {
      this.setState({ showNamingError: true });
    }
  }

  /**
   * @param {string} filter
   sets state updates filter
  */
  _setFilter(filter) {
    this.setState({ filterMenuOpen: false, filter });
    this._changeSearchParam({ filter });
  }
  /**
   * @param {string} section
   replaces history and checks session
  */
  _setSection(section) {
    if (section === 'cloud') {
      this._viewRemote();
    } else {
      this.props.history.replace(`../projects/${section}${this.props.history.location.search}`);
    }
  }
  /**
   * @param {object} labbook
   * returns true if labbook's name or description exists in filtervalue, else returns false
  */
  _filterSearch(labbook) {
    if (labbook.node && labbook.node.name && (this.props.filterText === '' || labbook.node.name.toLowerCase().indexOf(this.props.filterText.toLowerCase()) > -1 || labbook.node.description.toLowerCase().indexOf(this.props.filterText.toLowerCase()) > -1)) {
      return true;
    }
    return false;
  }
  /**
   * @param {array, string} localLabbooks.edges,filter
   * @return {array} filteredLabbooks
  */
  _filterLabbooks(labbooks, filter) {
    const username = localStorage.getItem('username');
    let self = this,
      filteredLabbooks = [];


    if (filter === 'owner') {
      filteredLabbooks = labbooks.filter(labbook => ((labbook.node.owner === username) && self._filterSearch(labbook)));
    } else if (filter === 'others') {
      filteredLabbooks = labbooks.filter(labbook => (labbook.node.owner !== username && self._filterSearch(labbook)));
    } else {
      filteredLabbooks = labbooks.filter(labbook => self._filterSearch(labbook));
    }

    return filteredLabbooks;
  }

  /**
    * @param {}
    * fires when handleSortFilter triggers refetch
    * references child components and triggers their refetch functions
  */
  _showModal() {
    this.refs.wizardModal._showModal();
  }

  /**
    *  @param {string} selected
    * fires when setSortFilter validates user can sort
    * triggers a refetch with new sort parameters
  */
  _handleSortFilter(orderBy, sort) {
    this.setState({ sortMenuOpen: false, orderBy, sort });
    this._changeSearchParam({ orderBy, sort });
    this.props.refetchSort(orderBy, sort);
  }

  /**
    *  @param {string, boolean} orderBy sort
    * fires when user selects a sort option
    * checks session and selectedSection state before handing off to handleSortFilter
  */
  _setSortFilter(orderBy, sort) {
    if (this.state.selectedSection === 'remoteLabbooks') {
      UserIdentity.getUserIdentity().then((response) => {
        if (navigator.onLine) {
          if (response.data) {
            if (response.data.userIdentity.isSessionValid) {
              this._handleSortFilter(orderBy, sort);
            } else {
              this.props.auth.renewToken(true, () => {
                if (!this.state.showLoginPrompt) {
                  this.setState({ showLoginPrompt: true });
                }
              }, () => {
                this._handleSortFilter(orderBy, sort);
              });
            }
          }
        } else if (!this.state.showLoginPrompt) {
          this.setState({ showLoginPrompt: true });
        }
      });
    } else {
      this._handleSortFilter(orderBy, sort);
    }
  }

  /**
    * @param {}
    * fires when user selects remote labbook view
    * checks user auth before changing selectedSection state
  */
  _viewRemote() {
    UserIdentity.getUserIdentity().then((response) => {
      if (navigator.onLine) {
        if (response.data && response.data.userIdentity.isSessionValid) {
          this.props.history.replace(`../projects/cloud${this.props.history.location.search}`);
          this.setState({ selectedSection: 'cloud' });
        } else {
          this.props.auth.renewToken(true, () => {
            if (!this.state.showLoginPrompt) {
              this.setState({ showLoginPrompt: true });
            }
          }, () => {
            this.props.history.replace(`../projects/cloud${this.props.history.location.search}`);
            this.setState({ selectedSection: 'cloud' });
          });
        }
      } else if (!this.state.showLoginPrompt) {
        this.setState({ showLoginPrompt: true });
      }
    });
  }

  /**
  *  @param {evt}
  *  sets the filterValue in state
  */
  _setFilterValue(evt) {
    setFilterText(evt.target.value);

    if (this.refs.labbookSearch.value !== evt.target.value) {
      this.refs.labbookSearch.value = evt.target.value;
    }
  }

  /**
    *  @param {object} newValues
    *  changes the query params to new sort and filter values
  */
  _changeSearchParam(newValues) {
    const searchObj = Object.assign({}, queryString.parse(this.props.history.location.search.slice(1)), newValues);
    this.props.history.replace(`..${this.props.history.location.pathname}?${queryString.stringify(searchObj)}`);
  }

  render() {
    const { props } = this;

    const labbooksCSS = classNames({
      Labbooks: true,
      'Labbooks--demo': window.location.hostname === config.demoHostName,
    });

    if (props.labbookList !== null || props.loading) {
      const localNavItemCSS = classNames({
        'Labbooks__nav-item': true,
        'Labbooks__nav-item--local': true,
        'Labbooks__nav-item--selected': this.state.selectedSection === 'local',
      });

      const cloudNavItemCSS = classNames({
        'Labbooks__nav-item': true,
        'Labbooks__nav-item--cloud': true,
        'Labbooks__nav-item--selected': this.state.selectedSection === 'cloud',
      });

      return (

        <div className={labbooksCSS}>

          <WizardModal
            ref="wizardModal"
            handler={this.handler}
            history={this.props.history}
            {...props}
          />

          <div className="Labbooks__panel-bar">
            <h6 className="Labbooks__username">{localStorage.getItem('username')}</h6>
            <h2 className="Labbooks__title" onClick={() => this.refs.wizardModal._showModal()} >
                Projects
            </h2>

          </div>
          <div className="Labbooks__menu  mui-container flex-0-0-auto">
            <ul className="Labbooks__nav  flex flex--row">
              <li className={localNavItemCSS}>
                <a onClick={() => this._setSection('local')}>Local</a>
              </li>
              <li className={cloudNavItemCSS}>
                <a onClick={() => this._setSection('cloud')}>Cloud</a>
              </li>

              <hr className={`Labbooks__navigation-slider Labbooks__navigation-slider--${this.state.selectedSection}`} />

              <ToolTip section="cloudLocal" />
            </ul>

          </div>
          <div className="Labbooks__subheader">
            <div className="Labbooks__search-container">
              {
                  this.state.showSearchCancel &&
                  (this.props.filterText.length !== 0) &&
                  <Fragment>
                    <div
                      className="Labbooks__search-cancel"
                      onClick={() => this._setFilterValue({ target: { value: '' } })}
                    />
                    <div className="Labbooks__search-cancel--text">Clear</div>
                  </Fragment>
                }
              <input
                type="text"
                ref="labbookSearch"
                className="Labbooks__search no--margin"
                placeholder="Filter Projects by name or description"
                defaultValue={this.props.filterText}
                onKeyUp={evt => this._setFilterValue(evt)}
                onFocus={() => this.setState({ showSearchCancel: true })}
              />
            </div>

            <LabbookFilterBy
              {...this.state}
              setFilter={this._setFilter}
            />
            <LabbookSort
              {...this.state}
              setSortFilter={this._setSortFilter}
            />

          </div>
          {
              props.loading ?
                <LocalLabbooks
                  loading
                  showModal={this._showModal}
                  section={this.props.section}
                />
              :
              this.state.selectedSection === 'local' ?
                <LocalLabbooksContainer
                  labbookListId={props.labbookList.id}
                  localLabbooks={props.labbookList.labbookList}
                  showModal={this._showModal}
                  goToLabbook={this._goToLabbook}
                  filterLabbooks={this._filterLabbooks}
                  filterState={this.state.filter}
                  setFilterValue={this._setFilterValue}
                  changeRefetchState={bool => this.setState({ refetchLoading: bool })}
                  {...props}
                />
              :
                <RemoteLabbooks
                  labbookListId={props.labbookList.labbookList.id}
                  remoteLabbooks={props.labbookList.labbookList}
                  showModal={this._showModal}
                  goToLabbook={this._goToLabbook}
                  filterLabbooks={this._filterLabbooks}
                  filterState={this.state.filter}
                  setFilterValue={this._setFilterValue}
                  forceLocalView={() => {
                  this.setState({ selectedSection: 'local' });
                  this.setState({ showLoginPrompt: true });
}
                }
                  changeRefetchState={bool => this.setState({ refetchLoading: bool })}
                  {...props}
                />
          }
          {
            this.state.showLoginPrompt &&
            <LoginPrompt closeModal={this._closeLoginPromptModal} />
          }
        </div>
      );
    } else if (props.labbookList === null) {
      UserIdentity.getUserIdentity().then((response) => {
        if (response.data && response.data.userIdentity.isSessionValid) {
          setErrorMessage('Failed to fetch Projects.', [{ message: 'There was an error while fetching Projects. This likely means you have a corrupted Project directory.' }]);
          return (
            <div className="Labbooks__fetch-error">
                There was an error attempting to fetch Projects. <br />
                Try restarting Gigantum and refresh the page.<br />
                If the problem persists <a target="_blank" href="https://docs.gigantum.com/discuss" rel="noopener noreferrer">request assistance here.</a>
            </div>
          );
        }
        this.props.auth.login();
      });
    } else {
      return (<Loader />);
    }
  }
}

const mapStateToProps = (state, ownProps) => ({
  filterText: state.labbookListing.filterText,
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(Labbooks);

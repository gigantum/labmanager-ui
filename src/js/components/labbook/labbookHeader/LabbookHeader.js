// vendor
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
// environment
import classNames from 'classnames';
// components
import Branches from './branches/Branches';
import BranchMenu from './branchMenu/BranchMenu';
import ContainerStatus from './containerStatus/ContainerStatus';
import ToolTip from 'Components/shared/ToolTip';
import ErrorBoundary from 'Components/shared/ErrorBoundary';
// config
import Config from 'JS/config';
// store
import store from 'JS/redux/store';
import {
  setSyncingState,
  setPublishingState,
  setExportingState,
  setModalVisible,
  setUpdateDetailView,
} from 'JS/redux/reducers/labbook/labbook';
// assets
import './LabbookHeader.scss';

class LabbookHeader extends Component {
  constructor(props) {
    super(props);

    // bind functions here
    this._setSelectedComponent = this._setSelectedComponent.bind(this);
    this._showLabbookModal = this._showLabbookModal.bind(this);
    this._hideLabbookModal = this._hideLabbookModal.bind(this);
  }

  /**
    @param {string} componentName - input string componenetName
    updates state of selectedComponent
    updates history prop
  */
  _setSelectedComponent = (componentName) => {
    if (componentName !== this.props.selectedComponent) {
      if (store.getState().detailView.selectedComponent === true) {
        setUpdateDetailView(false);
      }
    }
  }

  /**
    @param {object} item
    returns nav jsx
  */
  _getSelectedIndex() {
    const pathArray = this.props.location.pathname.split('/');
    const selectedPath = (pathArray.length > 4) ? pathArray[pathArray.length - 1] : 'overview';
    const defaultOrder = Config.defaultNavOrder;
    const selectedIndex = defaultOrder.indexOf(selectedPath);

    return selectedIndex;
  }

  /** *******************
   * child functions
   *
   ******************** */
  /**
   @param {boolean} isExporting
   updates container status state
   updates labbook state
  */
  _setExportingState = (isExporting) => {
    this.refs.ContainerStatus && this.refs.ContainerStatus.setState({ isExporting });

    if (this.props.isExporting !== isExporting) {
      setExportingState(isExporting);
    }
  }

  /**
    @param {}
    updates html element classlist and labbook state
  */
  _showLabbookModal = () => {
    if (!this.props.modalVisible) {
      setModalVisible(true);
    }
  }

  /**
    @param {}
    updates html element classlist and labbook state
  */
  _hideLabbookModal = () => {
    if (document.getElementById('labbookModal')) {
      document.getElementById('labbookModal').classList.add('hidden');
    }

    if (document.getElementById('modal__cover')) {
      document.getElementById('modal__cover').classList.add('hidden');
    }

    if (this.props.modalVisible) {
      setModalVisible(false);
    }
  }

  /**
    @param {boolean} isPublishing
    updates container status state
    updates labbook state
  */
 _setPublishingState = (isPublishing) => {
   this.refs.ContainerStatus && this.refs.ContainerStatus.setState({ isPublishing });

   if (this.props.isPublishing !== isPublishing) {
     setPublishingState(isPublishing);
   }
 }

  /** ***
  *  @param {boolean} isSyncing
  *  updates container status state
  *  updates labbook state
  *  @return {}
  */
  _setSyncingState = (isSyncing) => {
    this.refs.ContainerStatus && this.refs.ContainerStatus.setState({ isSyncing });

    if (this.props.isSyncing !== isSyncing) {
      setSyncingState(isSyncing);
    }
  }

  render() {
    const {
      labbookName, labbook, branchesOpen, branchName,
    } = this.props;
    const { visibility } = labbook;

    const selectedIndex = this._getSelectedIndex();

    const labbookHeaderCSS = classNames({
      LabbookHeader: true,
      'LabbookHeader--sticky': this.props.isSticky,
    });

    const branchesErrorCSS = classNames({
      BranchesError: this.props.branchesOpen,
      hidden: !this.props.branchesOpen,
    });

    return (

      <div className="LabbookHeader__wrapper">

        <div className={labbookHeaderCSS}>

          <div className="LabbookHeader__bar">

            <div className="LabbookHeader__columnContainer LabbookHeader__columnContainer--flex-1">

              <LabbookTitle
                self={this}
                visibility={visibility}
                labbook={labbook}
                branchName={branchName}
                labbookName={labbookName}
              />

              <BranchName
                self={this}
                branchesOpen={branchesOpen}
                branchName={branchName}
              />
            </div>

            <div className="LabbookHeader__columnContainer">

              <BranchMenu
                visibility={visibility}
                description={labbook.description}
                history={this.props.history}
                collaborators={labbook.collaborators}
                defaultRemote={labbook.defaultRemote}
                labbookId={labbook.id}
                remoteUrl={labbook.overview.remoteUrl}
                setSyncingState={this._setSyncingState}
                setPublishingState={this._setPublishingState}
                setExportingState={this._setExportingState}
                isExporting={this.props.isExporting}
                toggleBranchesView={this.props.toggleBranchesView}
                isMainWorkspace={branchName === 'workspace' || branchName === `gm.workspace-${localStorage.getItem('username')}`}
                auth={this.props.auth}
              />

              <ErrorBoundary type="containerStatusError" key="containerStatus">

                <ContainerStatus
                  ref="ContainerStatus"
                  base={labbook.environment.base}
                  containerStatus={labbook.environment.containerStatus}
                  imageStatus={labbook.environment.imageStatus}
                  labbookId={labbook.id}
                  setBuildingState={this.props.setBuildingState}
                  isBuilding={this.props.isBuilding}
                  isSyncing={this.props.isSyncing}
                  isPublishing={this.props.isPublishing}
                  creationDateUtc={labbook.creationDateUtc}
                />

              </ErrorBoundary>

            </div>

          </div>

          <ErrorBoundary
            type={branchesErrorCSS}
            key="branches"
          >

            <Branches
              defaultRemote={labbook.defaultRemote}
              branchesOpen={this.props.branchesOpen}
              labbook={labbook}
              labbookId={labbook.id}
              activeBranch={labbook.activeBranchName}
              toggleBranchesView={this.props.toggleBranchesView}
              mergeFilter={this.props.mergeFilter}
              setBuildingState={this.props.setBuildingState}
            />

          </ErrorBoundary>

        </div>

        <div className="LabbookHeader__navContainer flex-0-0-auto">

          <ul className="LabbookHeader__nav flex flex--row">
            {
              Config.navigation_items.map((item, index) => (
                <NavItem
                  self={this}
                  item={item}
                  index={index}
                  key={item.id}
                />))
            }

            <hr className={`LabbookHeader__navSlider LabbookHeader__navSlider--${selectedIndex}`} />
          </ul>

        </div>

      </div>
    );
  }
}

const LabbookTitle = ({
  self, visibility, labbook, branchName, labbookName,
}) => {
  const labbookLockCSS = classNames({
    [`LabbookHeader__${visibility}`]: true,
    [`LabbookHeader__${visibility}--sticky`]: self.props.isSticky,
  });

  const title = `${labbook.owner}/${labbookName}${self.props.isSticky ? '/ ' : ''}`;

  return (
    <div className="LabbookHeader__section--title">

      <div>
        {title}
      </div>

      {
        self.props.isSticky &&
        <div className="LabbookHeader__branchName">{branchName}</div>
      }

      { ((visibility === 'private') ||
          (visibility === 'public')) &&

          <div className={labbookLockCSS} />
      }
    </div>
  );
};

const BranchName = ({ self, branchesOpen, branchName }) => {
  const branchNameCSS = classNames({
    LabbookHeader__branchTitle: true,
    'LabbookHeader__branchTitle--open': branchesOpen,
    'LabbookHeader__branchTitle--closed': !branchesOpen,
  });

  return (
    <div className={branchNameCSS}>

      <div
        className="LabbookHeader__name"
        onClick={() => self.props.toggleBranchesView(!branchesOpen, false)}
      >
        {branchName}
      </div>

      <div
        onClick={() => self.props.toggleBranchesView(!branchesOpen, false)}
        className="LabbookHeader__branchToggle"
      />

      <ToolTip section="branchView" />
    </div>
  );
};
/**
    @param {object, int}
    retruns jsx for nav items and sets selected
    @return {jsx}
*/
const NavItem = ({ self, item, index }) => {
  const pathArray = self.props.location.pathname.split('/');
  const selectedPath = (pathArray.length > 4) ? pathArray[pathArray.length - 1] : 'overview'; // sets avtive nav item to overview if there is no menu item in the url

  const navItemCSS = classNames({
    'LabbookHeader__navItem--selected': selectedPath === item.id,
    [`LabbookHeader__navItem LabbookHeader__navItem--${item.id}`]: !selectedPath !== item.id,
    [`LabbookHeader__navItem--${index}`]: true,
  });

  return (
    <li
      id={item.id}
      className={navItemCSS}
      onClick={() => self._setSelectedComponent(item.id)}
    >

      <Link
        onClick={self._scrollToTop}
        to={`../../../projects/${self.props.owner}/${self.props.match.params.labbookName}/${item.id}`}
        replace
      >

        {item.name}

      </Link>

    </li>);
};

export default LabbookHeader;

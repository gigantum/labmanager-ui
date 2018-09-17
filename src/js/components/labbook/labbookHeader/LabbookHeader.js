//vendor
import React, { Component } from 'react'
import {Link} from 'react-router-dom';
//environment
import classNames from 'classnames'
//components
import Branches from './branches/Branches'
import BranchMenu from './branchMenu/BranchMenu'
import ContainerStatus from './containerStatus/ContainerStatus'
import ToolTip from 'Components/shared/ToolTip';
import ErrorBoundary from 'Components/shared/ErrorBoundary'
//config
import Config from 'JS/config'
//store
import store from 'JS/redux/store'
import {
  setSyncingState,
  setPublishingState,
  setExportingState,
  setModalVisible,
  setUpdateDetailView,
} from 'JS/redux/reducers/labbook/labbook'

class LabbookHeader extends Component {
  constructor(props){
    super(props);

    //bind functions here
    this._setSelectedComponent = this._setSelectedComponent.bind(this)
    this._showLabbookModal = this._showLabbookModal.bind(this)
    this._hideLabbookModal = this._hideLabbookModal.bind(this)
  }

  /**
    @param {object, int}
    retruns jsx for nav items and sets selected
    @return {jsx}
  */
  _getNavItem(item, index){

    const pathArray = this.props.location.pathname.split('/')
    const selectedPath = (pathArray.length > 4 ) ? pathArray[pathArray.length - 1] : 'overview' // sets avtive nav item to overview if there is no menu item in the url
    const navItemCSS = classNames({
      'selected': selectedPath === item.id,
      ['Labbook__navigation-item Labbook__navigation-item--' + item.id]: !selectedPath !== item.id,
      ['Labbook__navigation-item--' + index]: true,
    });

    return (
      <li
        id={item.id}
        key={item.id}
        className={navItemCSS}
        onClick={()=> this._setSelectedComponent(item.id)}
        >

        <Link
          onClick={this._scrollToTop}
          to={`../../../projects/${this.props.owner}/${this.props.match.params.labbookName}/${item.id}`}
          replace>

          {item.name}

        </Link>

      </li>)
  }

  /**
    @param {string} componentName - input string componenetName
    updates state of selectedComponent
    updates history prop
  */
  _setSelectedComponent = (componentName) =>{

    if(componentName !== this.props.selectedComponent){

      if(store.getState().detailView.selectedComponent === true){
        setUpdateDetailView(false)
      }
    }

  }

  /**
    @param {object} item
    returns nav jsx
  */
  _changeSlider() {

    const pathArray = this.props.location.pathname.split('/')
    const selectedPath = (pathArray.length > 4 ) ? pathArray[pathArray.length - 1] : 'overview'
    const defaultOrder = Config.defaultNavOrder;
    const selectedIndex = defaultOrder.indexOf(selectedPath);

    return (
      <hr className={' Labbook__navigation-slider Labbook__navigation-slider--' + selectedIndex}/>
    )
  }

  /*********************
   * child functions
   *
   *********************/

  /**
   @param {boolean} isExporting
   updates container status state
   updates labbook state
  */
  _setExportingState = (isExporting) => {

     this.refs['ContainerStatus'] && this.refs['ContainerStatus'].setState({ 'isExporting': isExporting })

     if (this.props.isExporting !== isExporting) {
        setExportingState(isExporting)
     }
  }

  /**
    @param {}
    updates html element classlist and labbook state
  */
  _showLabbookModal = () => {

    if(!this.props.modalVisible){
      setModalVisible(true)
    }
  }

  /**
    @param {}
    updates html element classlist and labbook state
  */
  _hideLabbookModal = () => {

    if(document.getElementById('labbookModal')){
      document.getElementById('labbookModal').classList.add('hidden')
    }

    if(document.getElementById('modal__cover')){
      document.getElementById('modal__cover').classList.add('hidden')
    }

    if(this.props.modalVisible){
      setModalVisible(false)
    }
  }

  /**
    @param {boolean} isPublishing
    updates container status state
    updates labbook state
  */
 _setPublishingState = (isPublishing) => {

    this.refs['ContainerStatus'] && this.refs['ContainerStatus'].setState({ 'isPublishing': isPublishing })

    if (this.props.isPublishing !== isPublishing) {
      setPublishingState(isPublishing)
    }
  }

  /**
    @param {boolean} isSyncing
    updates container status state
    updates labbook state
  */
  _setSyncingState = (isSyncing) => {
    this.refs['ContainerStatus'] && this.refs['ContainerStatus'].setState({ 'isSyncing': isSyncing })

    if (this.props.isSyncing !== isSyncing) {
      setSyncingState(isSyncing)
    }
  }

  render(){
    const {labbookName, labbook, branchesOpen, branchName} = this.props
    const {visibility} = labbook

    const branchNameCSS = classNames({
      'Labbook__branch-title': true,
      'Labbook__branch-title--open': branchesOpen,
      'Labbook__branch-title--closed': !branchesOpen
    })

    const labbookHeaderCSS = classNames({
      'Labbook__header': true,
      'is-sticky': this.props.isSticky,
      'is-expanded': this.props.isExpanded
    })

    const labbookLockCSS = classNames({
      [`Labbook__${visibility}`]: true,
      [`Labbook__${visibility}--sticky`]: this.props.isSticky
    })

    return(

     <div className="Labbook__header-container">

       <div className={labbookHeaderCSS}>

         <div className="Labbook__row-container">

          <div className="Labbook__column-container--flex-1">

            <div className="Labbook__name-title">

              <div>
                {`${labbook.owner}/${labbookName}${this.props.isSticky ? '/ ': ''}`}
              </div>

              {
                this.props.isSticky &&
                <div className="Labbook__name-branch">{branchName}</div>
              }

              {  ((visibility === 'private') ||
                  (visibility === 'public')) &&

                  <div className={labbookLockCSS}></div>
              }

              {
                this.props.isExpanded &&

                <div className="Labbook__navigation-container--header flex-0-0-auto column-1-span-11">
                  <ul className="Labbook__navigation Labbook__navigation--header flex flex--row">
                   {
                     Config.navigation_items.map((item, index) => {
                       return (this._getNavItem(item, index))
                     })
                   }
                   {
                     this._changeSlider()
                   }
                 </ul>

               </div>
              }
            </div>

            <div className={branchNameCSS}>

              <div
                className="Labbook__name"
                onClick={()=> this.props.toggleBranchesView(!branchesOpen, false)}>
                  {branchName}
              </div>

              <div
                onClick={()=> this.props.toggleBranchesView(!branchesOpen, false)}
                className="Labbook__branch-toggle">
              </div>

               <ToolTip section="branchView"/>

            </div>
       </div>

       <div className="Labbook__column-container">

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

       <div className={(this.props.branchesOpen) ? "Labbook__branches-container":" Labbook__branches-container Labbook__branches-container--collapsed"}>

         <div className={(this.props.branchesOpen) ? 'Labbook__branches-shadow Labbook__branches-shadow--upper' : 'hidden'}></div>

         <ErrorBoundary
           type={this.props.branchesOpen ?  'branchesError': 'hidden'}
           key="branches">

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

         <div className={(this.props.branchesOpen) ? 'Labbook__branches-shadow Labbook__branches-shadow--lower' : 'hidden'}></div>

       </div>

     </div>

     <div className="Labbook__navigation-container mui-container flex-0-0-auto">

          <ul className="Labbook__navigation flex flex--row">
            {
              Config.navigation_items.map((item, index) => {
                return (this._getNavItem(item, index))
              })
            }
            {
             (this._changeSlider())
            }
          </ul>

      </div>

    </div>
          )
  }
}

export default LabbookHeader

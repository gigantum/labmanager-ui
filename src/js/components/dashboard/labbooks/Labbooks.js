//vendor
import store from 'JS/redux/store'
import React, { Component } from 'react'
import classNames from 'classnames'
import queryString from 'query-string'
//components
import WizardModal from 'Components/wizard/WizardModal'
import Loader from 'Components/shared/Loader'
import LocalLabbooksContainer, {LocalLabbooks} from 'Components/dashboard/labbooks/localLabbooks/LocalLabbooks'
import RemoteLabbooks from 'Components/dashboard/labbooks/remoteLabbooks/RemoteLabbooks'
import LoginPrompt from 'Components/labbook/branchMenu/LoginPrompt'
//utils
import Validation from 'JS/utils/Validation'
//queries
import UserIdentity from 'JS/Auth/UserIdentity'

export default class Labbooks extends Component {

  constructor(props){
    super(props);

    const {filterText} = store.getState().labbookListing
    let {filter, sort, reverse} = queryString.parse(this.props.history.location.search)
    reverse = reverse === 'true'
    this.state = {
      'labbookModalVisible': false,
      'oldLabbookName': '',
      'newLabbookName':'',
      'renameError': '',
      'showNamingError': false,
      filter: filter || 'all',
      'sortMenuOpen': false,
      'refetchLoading': false,
      'selectedSection': 'local',
      'showLoginPrompt': false,
      sort: sort || 'modified_on',
      reverse: reverse || false,
      'filterValue': filterText,
      'filterMenuOpen': false,
    }

    this._closeSortMenu = this._closeSortMenu.bind(this);
    this._closeFilterMenu = this._closeFilterMenu.bind(this);
    this._goToLabbook = this._goToLabbook.bind(this)
    this._showModal = this._showModal.bind(this)
    this._filterSearch = this._filterSearch.bind(this)
    this._changeSlider = this._changeSlider.bind(this)
    this._setSortFilter = this._setSortFilter.bind(this)
    this._closeLoginPromptModal = this._closeLoginPromptModal.bind(this)
    this._filterLabbooks = this._filterLabbooks.bind(this)
    this._setfilter = this._setfilter.bind(this)
    this._changeSearchParam = this._changeSearchParam.bind(this)
  }

  /**
    * @param {}
    * subscribe to store to update state
    * set unsubcribe for store
  */
  componentWillMount() {
    let paths = this.props.history.location.pathname.split('/')
    let sectionRoute = paths.length > 2 ?  paths[2] : 'local'
    if(paths[2] !== 'cloud' && paths[2] !== 'local'){
      sectionRoute = 'local'
    }
    this.setState({'selectedSection': sectionRoute})

    document.title =  `Gigantum`
    window.addEventListener('click', this._closeSortMenu)
    window.addEventListener('click', this._closeFilterMenu)
    this.unsubscribe = store.subscribe(() =>{
      this.storeDidUpdate(store.getState().labbookListing)
    })

  }


  /**
    @param {object} labbookListing
    updates state of labbookListing when prompted to by the store
  */
  storeDidUpdate(labbookListing){
    let newerState = {};
    if(labbookListing.filterText !== this.state.filterValue){
      newerState.filterValue = labbookListing.filterText
    }
    this.setState(newerState)
  }


  /**
    * @param {}
    * fires when component unmounts
    * removes added event listeners
    * unsubscribe from redux store
  */
  componentWillUnmount() {
    this.unsubscribe()
    window.removeEventListener('click', this._closeSortMenu)
    window.removeEventListener('click', this._closeFiltertMenu)
    window.removeEventListener("scroll", this._captureScroll)
  }

  componentWillReceiveProps(nextProps) {
    let paths = nextProps.history.location.pathname.split('/')
    let sectionRoute = paths.length > 2 ?  paths[2] : 'local'
    if(paths[2] !== 'cloud' && paths[2] !== 'local'){
      this.props.history.replace(`../labbooks/local`)
    }
    this.setState({'selectedSection': sectionRoute})
  }

  /**
    * @param {}
    * fires when user identity returns invalid session
    * prompts user to revalidate their session
  */
  _closeLoginPromptModal(){
    this.setState({
      'showLoginPrompt': false
    })
    document.getElementById('modal__cover').classList.add('hidden')
  }

  /**
    * @param {event} evt
    * fires when sort menu is open and the user clicks elsewhere
    * hides the sort menu dropdown from the view
  */

  _closeSortMenu(evt) {
    let isSortMenu = evt.target.className.indexOf('Labbooks__sort') > -1

    if(!isSortMenu && this.state.sortMenuOpen) {
      this.setState({sortMenuOpen: false});
    }
  }
  /**
    * @param {event} evt
    * fires when filter menu is open and the user clicks elsewhere
    * hides the filter menu dropdown from the view
  */

  _closeFilterMenu(evt) {
    let isFilterMenu = evt.target.className.indexOf('Labbooks__filter') > -1

    if(!isFilterMenu && this.state.filterMenuOpen) {
      this.setState({filterMenuOpen: false});
    }
  }


  /**
    * @param {}
    * fires when a componet mounts
    * adds a scoll listener to trigger pagination
  */
  componentDidMount() {
    window.addEventListener('scroll', this._captureScroll);
  }


  /**
    *  @param {string} labbookName - inputs a labbook name
    *  routes to that labbook
  */
  _goToLabbook = (labbookName, owner) => {
    this.setState({'labbookName': labbookName, 'owner': owner})
    this.props.history.replace(`/labbooks/${owner}/${labbookName}`)
  }


  /**
    *  @param {string} labbookName
    *  closes labbook modal and resets state to initial state
  */
  _closeLabbook(labbookName){
    this.setState({
      labbookModalVisible: false,
      oldLabbookName: '',
      newLabbookName:'',
      showNamingError: false
    })

    if(document.getElementById('modal__cover')){
      document.getElementById('modal__cover').classList.add('hidden')
    }
  }

  /**
    *  @param {event} evt
    *  sets new labbook title to state
  */
  _setLabbookTitle(evt){

    let isValid = Validation.labbookName(evt.target.value)
    if(isValid){
      this.setState({
        newLabbookName: evt.target.value,
        showNamingError: false
      })
    }else{
      this.setState({showNamingError: true})
    }
  }

  /**
   * @param {string} filter
   sets state updates filter
  */
  _setfilter(filter){
    this.setState({filterMenuOpen: false, filter});
    this._changeSearchParam({filter})
  }
  /**
   * @param {string} section
   replaces history and checks session
  */
  _setSection(section){
    if(section === 'cloud'){
      this._viewRemote();
    } else {
      this.props.history.replace(`../labbooks/${section}${this.props.history.location.search}`)
    }
  }
  /**
   * @param {object} labbook
   * returns true if labbook's name or description exists in filtervalue, else returns false
  */
  _filterSearch(labbook){
    if(this.state.filterValue === '' || labbook.node.name.indexOf(this.state.filterValue) > -1 || labbook.node.description.indexOf(this.state.filterValue) > -1){
      return true;
    }
    return false;
  }
  /**
   * @param {array, string} localLabbooks.edges,filter
   * @return {array} filteredLabbooks
  */
  _filterLabbooks(labbooks, filter){
    let self = this;
    let filteredLabbooks = [];
    let username = localStorage.getItem('username')
    if(filter === 'owner'){
      filteredLabbooks = labbooks.filter((labbook) => {
          return ((labbook.node.owner === username) && self._filterSearch(labbook))
      })

    }else if(filter === "others"){
      filteredLabbooks = labbooks.filter((labbook)=>{
          return (labbook.node.owner !== username  && self._filterSearch(labbook))
      })
    }else{
      filteredLabbooks = labbooks.filter((labbook)=>{
        return self._filterSearch(labbook)
      });
    }


    return filteredLabbooks
  }

  /**
    * @param {}
    * fires when handleSortFilter triggers refetch
    * references child components and triggers their refetch functions
  */
  _showModal(){
    this.refs.wizardModal._showModal()
  }

  /**
    *  @param {string} selected
    * fires when setSortFilter validates user can sort
    * triggers a refetch with new sort parameters
  */
  _handleSortFilter(sort, reverse) {
    this.setState({sortMenuOpen: false, sort, reverse});
    this._changeSearchParam({sort, reverse})
    this.props.refetchSort(sort, reverse)
  }

  /**
    *  @param {string, boolean} sort reverse
    * fires when user selects a sort option
    * checks session and selectedSection state before handing off to handleSortFilter
  */
  _setSortFilter(sort, reverse) {
    if(this.state.selectedSection === 'remoteLabbooks') {
      UserIdentity.getUserIdentity().then(response => {
        if(response.data){
          if(response.data.userIdentity.isSessionValid){
            this._handleSortFilter(sort, reverse);
          } else {
            this.setState({'showLoginPrompt': true})
            document.getElementById('modal__cover').classList.remove('hidden')
          }
        }
      })
    } else{
      this._handleSortFilter(sort, reverse);
    }
  }

  /**
    * @param {}
    * fires in component render
    * sets classnames for navigation slider to work as intended
  */

  _changeSlider() {
    let defaultOrder = ['local', 'cloud'];
    let selectedIndex = defaultOrder.indexOf(this.state.selectedSection);
    return (
      <hr className={'Labbooks__navigation-slider Labbooks__navigation-slider--' + selectedIndex}/>
    )
  }

  /**
    * @param {}
    * fires when user selects remote labbook view
    * checks user auth before changing selectedSection state
  */
  _viewRemote(){
    UserIdentity.getUserIdentity().then(response => {
      if(response.data && response.data.userIdentity.isSessionValid){
        this.props.history.replace(`../labbooks/cloud${this.props.history.location.search}`)
        this.setState({selectedSection: 'cloud'})
      } else {
        if(!this.state.showLoginPrompt) {
          this.setState({'showLoginPrompt': true})
          document.getElementById('modal__cover').classList.remove('hidden')
        }
      }
    })
  }

  /**
  *  @param {evt}
  *  sets the filterValue in state
  */
  _setFilterValue(evt) {
    store.dispatch({
      type: 'SET_FILTER_TEXT',
      payload: {
        filterText: evt.target.value
      }
    })
  }

  _getFilter(){
    switch(this.state.filter){
      case 'all':
        return 'All'
      case 'owner':
        return 'My Labbooks'
      case 'others':
        return 'Shared With Me'
      default:
        return this.state.filter
    }
  }

  _getSelectedSort(){
    if(this.state.sort === 'modified_on'){
      return `Modified Date ${this.state.reverse ? '(Oldest)' : '(Newest)'}`
    } else if(this.state.sort === 'created_on'){
      return `Creation Date ${this.state.reverse ? '(Oldest)' : '(Newest)'}`
    } else {
      return this.state.reverse ? 'Z-A' : 'A-Z';
    }
  }
  _changeSearchParam(newValues){
    let searchObj = Object.assign({}, queryString.parse(this.props.history.location.search), newValues)
    this.props.history.replace(`..${this.props.history.location.pathname}?${queryString.stringify(searchObj)}`)
  }

  render(){
      let {props} = this;
      let loginPromptModalCss = classNames({
        'CreateLabbook--login-prompt': this.state.showLoginPrompt,
        'hidden': !this.state.showLoginPrompt
      })
      if(props.labbookList !== null || props.loading){

        return(

          <div className="Labbooks">
            <WizardModal
              ref="wizardModal"
              handler={this.handler}
              history={this.props.history}
              {...props}
            />

            <div className="Labbooks__title-bar">
              <h6 className="Labbooks__username">{localStorage.getItem('username')}</h6>
              <h2 className="Labbooks__title" onClick={()=> this.refs.wizardModal._showModal()} >
                LabBooks
              </h2>

            </div>
            <div className="Labbooks__menu  mui-container flex-0-0-auto">
              <ul className="Labbooks__nav  flex flex--row">
                <li className={this.state.selectedSection === 'local' ? 'Labbooks__nav-item--0 selected' : 'Labbooks__nav-item--0' }>
                  <a onClick={()=> this._setSection('local')}>Local</a>
                </li>
                <li className={this.state.selectedSection === 'cloud' ? 'Labbooks__nav-item--1 selected' : 'Labbooks__nav-item--1' }>
                  <a onClick={()=> this._setSection('cloud')}>Cloud</a>
                </li>
                {
                  this._changeSlider()
                }
              </ul>

            </div>
            <div className="Labbooks__subheader">
              <div className="Labbooks__search-container">
                <input
                  type="text"
                  className="Labbooks__search no--margin"
                  placeholder="Filter Labbooks by name or description"
                  defaultValue={this.state.filterValue}
                  onKeyUp={(evt) => this._setFilterValue(evt)}
                />
              </div>
              <div className="Labbooks__filter">
                Filter by:
                <span
                  className={this.state.filterMenuOpen ? 'Labbooks__filter-expanded' : 'Labbooks__filter-collapsed'}
                  onClick={() => !this.setState({ filterMenuOpen: !this.state.filterMenuOpen })}
                >
                  {this._getFilter()}
                </span>
                <ul
                  className={this.state.filterMenuOpen ? 'Labbooks__filter-menu' : 'hidden'}
                >
                  <li
                    className={'Labbooks__filter-item'}
                    onClick={()=>this._setfilter('all')}
                  >
                    All {this.state.filter === 'all' ?  '✓ ' : ''}
                  </li>
                  <li
                    className={'Labbooks__filter-item'}
                    onClick={()=>this._setfilter('owner')}
                  >
                   My Labbooks {this.state.filter === 'owner' ?  '✓ ' : ''}
                  </li>
                  <li
                    className={'Labbooks__filter-item'}
                    onClick={()=>this._setfilter('others')}
                  >
                    Shared with me {this.state.filter === 'others' ?  '✓ ' : ''}
                  </li>
                </ul>
              </div>
              <div className="Labbooks__sort">
                Sort by:
                <span
                  className={this.state.sortMenuOpen ? 'Labbooks__sort-expanded' : 'Labbooks__sort-collapsed'}
                  onClick={() => !this.setState({ sortMenuOpen: !this.state.sortMenuOpen })}
                >
                  {this._getSelectedSort()}
                </span>
                <ul
                  className={this.state.sortMenuOpen ? 'Labbooks__sort-menu' : 'hidden'}
                >
                  <li
                    className={'Labbooks__sort-item'}
                    onClick={()=>this._setSortFilter('modified_on', false)}
                  >
                    Modified Date (Newest) {this.state.sort === 'modified_on' && !this.state.reverse ?  '✓ ' : ''}
                  </li>
                  <li
                    className={'Labbooks__sort-item'}
                    onClick={()=>this._setSortFilter('modified_on', true)}
                  >
                    Modified Date (Oldest) {this.state.sort === 'modified_on' && this.state.reverse ?  '✓ ' : ''}
                  </li>
                  <li
                    className={'Labbooks__sort-item'}
                    onClick={()=>this._setSortFilter('created_on', false)}
                  >
                    Creation Date (Newest) {this.state.sort === 'created_on' && !this.state.reverse ?  '✓ ' : ''}
                  </li>
                  <li
                    className={'Labbooks__sort-item'}
                    onClick={()=>this._setSortFilter('created_on', true)}
                  >
                    Creation Date (Oldest) {this.state.sort === 'created_on' && this.state.reverse ?  '✓ ' : ''}
                  </li>
                  <li
                    className="Labbooks__sort-item"
                    onClick={()=>this._setSortFilter('az', false)}
                  >
                    A-Z {this.state.sort === 'az' && !this.state.reverse ?  '✓ ' : ''}
                  </li>
                  <li
                    className="Labbooks__sort-item"
                    onClick={()=>this._setSortFilter('az', true)}
                  >
                    Z-A {this.state.sort === 'az' && this.state.reverse ?  '✓ ' : ''}
                  </li>
                </ul>
              </div>
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
                changeRefetchState={(bool) => this.setState({refetchLoading: bool})}
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
                forceLocalView={()=> {
                  this.setState({selectedSection: 'local'})
                  this.setState({'showLoginPrompt': true})
                  document.getElementById('modal__cover').classList.remove('hidden')}
                }
                changeRefetchState={(bool) => this.setState({refetchLoading: bool})}
                {...props}
              />
          }
          <div className={loginPromptModalCss}>
            <div
              onClick={()=>{this._closeLoginPromptModal()}}
              className="BranchModal--close"></div>
            <LoginPrompt closeModal={this._closeLoginPromptModal}/>
          </div>
        </div>
      )
      } else if (props.labbookList === null) {

        UserIdentity.getUserIdentity().then(response => {
          if(response.data && response.data.userIdentity.isSessionValid){
            store.dispatch({
              type: 'ERROR_MESSAGE',
              payload: {
                message: `Failed to fetch LabBooks.`,
                messageBody: [{ message: 'There was an error while fetching LabBooks. This likely means you have a corrupted LabBook file.' }]
              }
            })
            return (
              <div className="Labbooks__fetch-error">
                There was an error attempting to fetch LabBooks. <br />
                Try restarting Gigantum and refresh the page.<br />
                If the problem persists <a target="_blank" href="https://docs.gigantum.com/discuss" rel="noopener noreferrer">request assistance here.</a>
              </div>
            )
          } else {
            this.props.auth.login();
          }
        })
      } else {
        return (<Loader />)
      }

  }
}

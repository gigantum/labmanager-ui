//vendor
import store from 'JS/redux/store'
import React, { Component } from 'react'
import {
  createFragmentContainer,
  graphql,
} from 'react-relay'
import classNames from 'classnames'
//components
import WizardModal from 'Components/wizard/WizardModal'
import Loader from 'Components/shared/Loader'
import LocalLabbooks from 'Components/dashboard/labbooks/localLabbooks/LocalLabbooks'
import RemoteLabbooks from 'Components/dashboard/labbooks/remoteLabbooks/RemoteLabbooks'
import LoginPrompt from 'Components/labbook/branchMenu/LoginPrompt'
//Mutations
import RenameLabbookMutation from 'Mutations/RenameLabbookMutation'
//utils
import Validation from 'JS/utils/Validation'
//queries
import UserIdentity from 'JS/Auth/UserIdentity'

let isLoadingMore = false;

class Labbooks extends Component {

  constructor(props){
  	super(props);

    this.state = {
      'labbookModalVisible': false,
      'oldLabbookName': '',
      'newLabbookName':'',
      'renameError': '',
      'showNamingError': false,
      'filter': 'all',
      'selectedSort': 'Modified Date (Newest)',
      'sortMenuOpen': false,
      'refetchLoading': false,
      'selectedSection': 'localLabbooks',
      'showLoginPrompt': false,
      'sort': 'modified_on',
      'reverse': false,
      'wasSorted': false,
    }

    this._closeSortMenu = this._closeSortMenu.bind(this);
    this._goToLabbook = this._goToLabbook.bind(this)
    this._showModal = this._showModal.bind(this)
    this._changeSlider = this._changeSlider.bind(this)
    this._setSortFilter = this._setSortFilter.bind(this)
    this._refetch = this._refetch.bind(this)
    this._closeLoginPromptModal = this._closeLoginPromptModal.bind(this)
  }

  componentWillMount() {

    let paths = this.props.history.location.pathname.split('/')
    let filterRoute = paths.length > 2 ?  paths[2] : 'all'

    this.setState({'filter': filterRoute})

    document.title =  `Gigantum`
    window.addEventListener('click', this._closeSortMenu)

  }

  /**
    * @param {}
    * fires when component unmounts
    * removes added event listeners
  */
  componentWillUnmount() {
    window.removeEventListener('click', this._closeSortMenu)
    window.removeEventListener("scroll", this._captureScroll)
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

  componentWillReceiveProps(nextProps) {

    let paths = nextProps.history.location.pathname.split('/')
    let filterRoute = paths.length > 2 ?  paths[2] : 'all'

    this.setState({'filter': filterRoute})
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
  _setFilter(filter){
       this.props.history.replace(`../labbooks/${filter}`)
  }
  /**
   * @param {array, string} localLabbooks.edges,filter
   * @return {array} filteredLabbooks
  */
  _filterLabbooks(labbooks, filter){
    let filteredLabbooks = [];
    let username = localStorage.getItem('username')
    if(filter === username){
      filteredLabbooks = labbooks.filter((labbook)=>{
          return (labbook.node.owner === username)
      })

    }else if(filter === "others"){
      filteredLabbooks = labbooks.filter((labbook)=>{
          return (labbook.node.owner !== username)
      })
    }else{
      filteredLabbooks = labbooks;
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
  _handleSortFilter(selected) {
    this.setState({sortMenuOpen: false, selectedSort: selected});
    switch(selected){
      case 'Modified Date (Newest)':
        this._refetch('modified_on', false);
        break;
      case 'Modified Date (Oldest)':
        this._refetch('modified_on', true);
        break;
      case 'Creation Date (Newest)':
        this._refetch('created_on', false);
        break;
      case 'Creation Date (Oldest)':
        this._refetch('created_on', true);
        break;
      case 'A-Z':
        this._refetch('az', false);
        break;
      case 'Z-A':
        this._refetch('az', true);
        break;
      default:
        break;
    }
  }

  /**
    *  @param {string} selected
    * fires when user selects a sort option
    * checks session and selectedSection state before handing off to handleSortFilter
  */
  _setSortFilter(selected) {
    if(this.state.selectedSection === 'remoteLabbooks') {
      UserIdentity.getUserIdentity().then(response => {
        if(response.data){
          if(response.data.userIdentity.isSessionValid){
            this._handleSortFilter(selected);
          } else {
            this.setState({'showLoginPrompt': true})
            document.getElementById('modal__cover').classList.remove('hidden')
          }
        }
      })
    } else{
      this._handleSortFilter(selected);
    }
  }

  /**
    * @param {string, boolean} sort reverse
    * fires when handleSortFilter triggers refetch
    * references child components and triggers their refetch functions
  */

  _refetch(sort, reverse){
    this.setState({sort, reverse, wasSorted: true})
  }

  /**
    * @param {}
    * fires in component render
    * sets classnames for navigation slider to work as intended
  */

  _changeSlider() {
    let defaultOrder = ['all', localStorage.getItem('username'), 'others'];
    let selectedIndex = defaultOrder.indexOf(this.state.filter);
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
        this.setState({selectedSection: 'remoteLabbooks'})
      } else {
        if(!this.state.showLoginPrompt) {
          this.setState({'showLoginPrompt': true})
          document.getElementById('modal__cover').classList.remove('hidden')
        }
      }
    })
  }

  render(){
      let {props} = this;
      let owner = localStorage.getItem('username')
      let loginPromptModalCss = classNames({
        'CreateLabbook--login-prompt': this.state.showLoginPrompt,
        'hidden': !this.state.showLoginPrompt
      })
      if(props.labbookList){

        return(

          <div className="Labbooks">
          {
            this.state.refetchLoading &&
            <Loader />
          }
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
                <li className={this.state.filter === 'all' ? 'Labbooks__nav-item--0 selected' : 'Labbooks__nav-item--0' }>
                  <a onClick={()=> this._setFilter('all')}>All</a>
                </li>
                <li className={this.state.filter === owner ? 'Labbooks__nav-item--1 selected' : 'Labbooks__nav-item--1' }>
                  <a onClick={()=> this._setFilter(owner)}>My LabBooks</a>
                </li>
                <li className={this.state.filter === 'others' ? 'Labbooks__nav-item--2 selected' : 'Labbooks__nav-item--2' }>
                  <a onClick={()=> this._setFilter('others')}>Shared With Me</a>
                </li>
                {
                  this._changeSlider()
                }
              </ul>

            </div>
            <div className="Labbooks__subheader">
              <div className="Labbooks__sort">
                Sort by:
                {
                  this.state.refetchLoading ?
                    <div className="Labbooks__sorting">Sorting Labbooks...</div>
                    :
                    <span
                      className={this.state.sortMenuOpen ? 'Labbooks__sort-expanded' : 'Labbooks__sort-collapsed'}
                      onClick={() => !this.setState({ sortMenuOpen: !this.state.sortMenuOpen })}
                    >
                      {this.state.selectedSort}
                    </span>
                }
                <ul
                  className={this.state.sortMenuOpen ? 'Labbooks__sort-menu' : 'hidden'}
                >
                  <li
                    className={'Labbooks__sort-item'}
                    onClick={()=>this._setSortFilter('Modified Date (Newest)')}
                  >
                    Modified Date (Newest) {this.state.selectedSort === 'Modified Date (Newest)' ?  '✓ ' : ''}
                  </li>
                  <li
                    className={'Labbooks__sort-item'}
                    onClick={()=>this._setSortFilter('Modified Date (Oldest)')}
                  >
                    Modified Date (Oldest) {this.state.selectedSort === 'Modified Date (Oldest)' ?  '✓ ' : ''}
                  </li>
                  <li
                    className={'Labbooks__sort-item'}
                    onClick={()=>this._setSortFilter('Creation Date (Newest)')}
                  >
                    Creation Date (Newest) {this.state.selectedSort === 'Creation Date (Newest)' ?  '✓ ' : ''}
                  </li>
                  <li
                    className={'Labbooks__sort-item'}
                    onClick={()=>this._setSortFilter('Creation Date (Oldest)')}
                  >
                    Creation Date (Oldest) {this.state.selectedSort === 'Creation Date (Oldest)' ?  '✓ ' : ''}
                  </li>
                  <li
                    className="Labbooks__sort-item"
                    onClick={()=>this._setSortFilter('A-Z')}
                  >
                    A-Z {this.state.selectedSort === 'A-Z' ?  '✓ ' : ''}
                  </li>
                  <li
                    className="Labbooks__sort-item"
                    onClick={()=>this._setSortFilter('Z-A')}
                  >
                    Z-A {this.state.selectedSort === 'Z-A' ?  '✓ ' : ''}
                  </li>
                </ul>
              </div>
              <div className="Labbooks__section">
                <button
                  className="Labbooks__local-button"
                  disabled={this.state.selectedSection === 'localLabbooks'}
                  onClick={()=>this.setState({selectedSection: 'localLabbooks'})}
                >
                  Local
                </button>
                <button
                  className="Labbooks__cloud-button"
                  disabled={this.state.selectedSection === 'remoteLabbooks'}
                  onClick={()=>this._viewRemote()}
                >
                  Cloud
                </button>
              </div>

            </div>
            {
              this.state.selectedSection === 'localLabbooks' ?
              <LocalLabbooks
                wasSorted={this.state.wasSorted}
                sort={this.state.sort}
                reverse={this.state.reverse}
                labbookListId={props.labbookList.id}
                localLabbooks={props.labbookList.labbookList}
                showModal={this._showModal}
                goToLabbook={this._goToLabbook}
                filterLabbooks={this._filterLabbooks}
                filterState={this.state.filter}
                changeRefetchState={(bool) => this.setState({refetchLoading: bool})}
                sortProcessed={()=> this.setState({wasSorted: false})}
                {...props}
              />
              :
              <RemoteLabbooks
                wasSorted={this.state.wasSorted}
                sort={this.state.sort}
                reverse={this.state.reverse}
                labbookListId={props.labbookList.labbookList.id}
                remoteLabbooks={props.labbookList.labbookList}
                showModal={this._showModal}
                goToLabbook={this._goToLabbook}
                filterLabbooks={this._filterLabbooks}
                filterState={this.state.filter}
                sortProcessed={()=> this.setState({wasSorted: false})}
                forceLocalView={()=> {
                  this.setState({selectedSection: 'localLabbooks'})
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
                If the problem persists <a target="_blank" href="https://docs.gigantum.io/discuss" rel="noopener noreferrer">request assistance here.</a>
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

export default createFragmentContainer(
  Labbooks,
  graphql`
    fragment Labbooks_labbookList on LabbookQuery{
      labbookList{
        id
        ...LocalLabbooks_localLabbooks
        ...RemoteLabbooks_remoteLabbooks
      }
    }
  `
);

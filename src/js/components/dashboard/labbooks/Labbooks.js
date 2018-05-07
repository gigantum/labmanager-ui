//vendor
import store from 'JS/redux/store'
import React, { Component } from 'react'
import {
  createPaginationContainer,
  graphql
} from 'react-relay'
//components
import WizardModal from 'Components/wizard/WizardModal'
import Loader from 'Components/shared/Loader'
import LocalLabbooks from 'Components/dashboard/labbooks/localLabbooks/LocalLabbooks'
import ImportModule from 'Components/import/ImportModule'
//Mutations
import RenameLabbookMutation from 'Mutations/RenameLabbookMutation'
//utils
import Validation from 'JS/utils/Validation'

let isLoadingMore = false;
let refetchLoading = false;
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
      'refetchLoading': false
    }

    this._closeSortMenu = this._closeSortMenu.bind(this);
    this._goToLabbook = this._goToLabbook.bind(this)
    this._loadMore = this._loadMore.bind(this)
    this._showModal = this._showModal.bind(this)
    this._captureScroll = this._captureScroll.bind(this)
  }

  componentWillMount() {

    let paths = this.props.history.location.pathname.split('/')
    let filterRoute = paths.length > 2 ?  paths[2] : 'all'

    this.setState({'filter': filterRoute})

    document.title =  `Gigantum`
    window.addEventListener('click', this._closeSortMenu)

  }

  componentWillUnmount() {
    window.removeEventListener('click', this._closeSortMenu)
    window.removeEventListener("scroll", this._captureScroll)
  }
  _closeSortMenu(evt) {
    let isSortMenu = evt.target.className.indexOf('LocalLabbooks__sort') > -1

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
  * fires when a componet mounts
  * adds a scoll listener to trigger pagination
  */
  componentDidMount() {

    window.addEventListener('scroll', this._captureScroll);
  }
/**
*  @param {}
*  captures scrolling event
*/
_captureScroll = () => {
  let root = document.getElementById('root')
  let distanceY = window.innerHeight + document.documentElement.scrollTop + 200,
      expandOn = root.offsetHeight;

  if(this.props.feed.localLabbooks){
    if ((distanceY > expandOn) && !isLoadingMore && this.props.feed.localLabbooks.pageInfo.hasNextPage) {
        this._loadMore();
    }
  }
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
  *  @param {}
  *  loads more labbooks using the relay pagination container
  */
  _loadMore = () => {
    isLoadingMore = true

    if(this.props.feed.localLabbooks.pageInfo.hasNextPage){
      this.props.relay.loadMore(
        10, // Fetch the next 10 feed items
        (ev) => {
          isLoadingMore = false;
        }
      );
    }
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
      //this.setState({filter: filter})
       this.props.history.replace(`../labbooks/${filter}`)
  }
  /**
   * @param {array, string} localLabbooks.edges,filter

    @return {array} filteredLabbooks
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

  _showModal(){
    this.refs.wizardModal._showModal()
  }


  _setSortFilter(selected) {
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

  _refetch(sort, reverse){
    let self = this;
    let relay = self.props.relay;
    this.setState({refetchLoading: true})

    relay.refetchConnection(
      20,
      (res, err)=>{
        if(err){
          console.log(err)
        }
        this.setState({refetchLoading: false})

      },
      {first: 20,
        cursor: null,
        sort: sort,
        reverse: reverse,
      }
    )
  }

  _changeSlider() {
    let pathArray = store.getState().routes.callbackRoute.split('/')
    let selectedPath = (pathArray.length > 2 ) ? pathArray[pathArray.length - 1] : 'all'
    let defaultOrder = ['all', localStorage.getItem('username'), 'others'];
    let selectedIndex = defaultOrder.indexOf(selectedPath);
    return (
      <hr className={'LocalLabbooks__navigation-slider LocalLabbooks__navigation-slider--' + selectedIndex}/>
    )
  }

  render(){
      let {props} = this;
      let owner = localStorage.getItem('username')
      if(props.feed.localLabbooks){

        let labbooks = this._filterLabbooks(props.feed.localLabbooks.edges, this.state.filter)
        return(

          <div className="LocalLabbooks">
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

            <div className="LocalLabbooks__title-bar">
              <h6 className="LocalLabbooks__username">{localStorage.getItem('username')}</h6>
              <h2 className="LocalLabbooks__title" onClick={()=> this.refs.wizardModal._showModal()} >
                LabBooks
              </h2>

            </div>
            <div className="LocalLabbooks__menu  mui-container flex-0-0-auto">

              <ul className="LocalLabbooks__nav  flex flex--row">
                <li className={this.state.filter === 'all' ? 'LocalLabbooks__nav-item--0 selected' : 'LocalLabbooks__nav-item--0' }>
                  <a onClick={()=> this._setFilter('all')}>All</a>
                </li>
                <li className={this.state.filter === owner ? 'LocalLabbooks__nav-item--1 selected' : 'LocalLabbooks__nav-item--1' }>
                  <a onClick={()=> this._setFilter(owner)}>My LabBooks</a>
                </li>
                <li className={this.state.filter === 'others' ? 'LocalLabbooks__nav-item--2 selected' : 'LocalLabbooks__nav-item--2' }>
                  <a onClick={()=> this._setFilter('others')}>Shared With Me</a>
                </li>
                {
                  this._changeSlider()
                }
              </ul>

            </div>
            <div className="LocalLabbooks__sort">
              Sort by:
              {
                this.state.refetchLoading ?
                  <div className="LocalLabbooks__sorting">Sorting Labbooks...</div>
                  :
                  <span
                    className={this.state.sortMenuOpen ? 'LocalLabbooks__sort-expanded' : 'LocalLabbooks__sort-collapsed'}
                    onClick={() => !this.setState({ sortMenuOpen: !this.state.sortMenuOpen })}
                  >
                    {this.state.selectedSort}
                  </span>
              }
              <ul
                className={this.state.sortMenuOpen ? 'LocalLabbooks__sort-menu' : 'hidden'}
              >
                <li
                  className={'LocalLabbooks__sort-item'}
                  onClick={()=>this._setSortFilter('Modified Date (Newest)')}
                >
                  Modified Date (Newest) {this.state.selectedSort === 'Modified Date (Newest)' ?  '✓ ' : ''}
                </li>
                <li
                  className={'LocalLabbooks__sort-item'}
                  onClick={()=>this._setSortFilter('Modified Date (Oldest)')}
                >
                  Modified Date (Oldest) {this.state.selectedSort === 'Modified Date (Oldest)' ?  '✓ ' : ''}
                </li>
                <li
                  className={'LocalLabbooks__sort-item'}
                  onClick={()=>this._setSortFilter('Creation Date (Newest)')}
                >
                  Creation Date (Newest) {this.state.selectedSort === 'Creation Date (Newest)' ?  '✓ ' : ''}
                </li>
                <li
                  className={'LocalLabbooks__sort-item'}
                  onClick={()=>this._setSortFilter('Creation Date (Oldest)')}
                >
                  Creation Date (Oldest) {this.state.selectedSort === 'Creation Date (Oldest)' ?  '✓ ' : ''}
                </li>
                <li
                  className="LocalLabbooks__sort-item"
                  onClick={()=>this._setSortFilter('A-Z')}
                >
                  A-Z {this.state.selectedSort === 'A-Z' ?  '✓ ' : ''}
                </li>
                <li
                  className="LocalLabbooks__sort-item"
                  onClick={()=>this._setSortFilter('Z-A')}
                >
                  Z-A {this.state.selectedSort === 'Z-A' ?  '✓ ' : ''}
                </li>
              </ul>
            </div>

            <LocalLabbooks
              labbooks={labbooks}
              showModal={this._showModal}
              {...props}
            />

        </div>
      )
    } else if(props.feed.localLabbooks === null){
      store.dispatch({
        type: 'ERROR_MESSAGE',
        payload:{
          message: `Failed to fetch LabBooks.`,
          messageBody: [{message: 'There was an error while fetching LabBooks. This likely means you have a corrupted LabBook file.'}]
        }
      })
      return <div className="LocalLabbooks__fetch-error">There was an error attempting to fetch LabBooks. <br/>Try restarting Gigantum and refresh the page.<br/>If the problem persists <a target="_blank" href="https://docs.gigantum.io/discuss" rel="noopener noreferrer">request assistance here.</a></div>
    } else{
      return(<Loader />)
    }

  }
}

export default createPaginationContainer(
  Labbooks,
  {feed: graphql`
      fragment Labbooks_feed on LabbookQuery{
        localLabbooks(first: $first, after: $cursor, sort: $sort, reverse: $reverse)@connection(key: "Labbooks_localLabbooks"){
          edges {
            node {
              name
              description
              owner
              creationDateUtc
              environment{
                id
                imageStatus
                containerStatus
              }
            }
            cursor
          }
          pageInfo {
            endCursor
            hasNextPage
            hasPreviousPage
            startCursor
          }
        }
      }
    `,
  },
  {
    direction: 'forward',
    getConnectionFromProps(props, error) {
      return props.feed.localLabbooks
    },
    getFragmentVariables(prevVars, first, cursor) {
      return {
        ...prevVars,
        first: first
      };
    },
    getVariables(props, {first, cursor, sort, reverse}, fragmentVariables) {
      first = 10;
      cursor = props.feed.localLabbooks.pageInfo.endCursor;
      sort = fragmentVariables.sort;
      reverse = fragmentVariables.reverse
      return {
        first,
        cursor,
        sort,
        reverse
        // in most cases, for variables other than connection filters like
        // `first`, `after`, etc. you may want to use the previous values.
      };
    },
    query: graphql`
      query LabbooksPaginationQuery(
        $first: Int!
        $cursor: String
        $sort: String
        $reverse: Boolean
      ) {
          ...Labbooks_feed
      }
    `
  }
);

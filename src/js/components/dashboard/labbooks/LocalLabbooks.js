//vendor
import React, { Component } from 'react'
import {
  createPaginationContainer,
  graphql
} from 'react-relay'
//components
import WizardModal from 'Components/wizard/WizardModal'
import Loader from 'Components/shared/Loader'
import LocalLabbookPanel from 'Components/dashboard/labbooks/LocalLabbookPanel'
import ImportModule from 'Components/import/ImportModule'
//Mutations
import RenameLabbookMutation from 'Mutations/RenameLabbookMutation'
//utils
import Validation from 'JS/utils/Validation'

let isLoadingMore = false;

class LocalLabbooks extends Component {

  constructor(props){
  	super(props);

    this.state = {
      'labbookModalVisible': false,
      'oldLabbookName': '',
      'newLabbookName':'',
      'renameError': '',
      'showNamingError': false,
      'filter': 'all'
    }

    this._goToLabbook = this._goToLabbook.bind(this)
    this._loadMore = this._loadMore.bind(this)
    this._showModal = this._showModal.bind(this)
  }

  componentWillMount() {

    let paths = this.props.history.location.pathname.split('/')
    let filterRoute = paths.length > 2 ?  paths[2] : 'all'

    this.setState({'filter': filterRoute})

    document.title =  `Gigantum`

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
    let that = this;
    window.addEventListener('scroll', function(e){
      let root = document.getElementById('root')
      let distanceY = window.innerHeight + document.documentElement.scrollTop + 200,
          expandOn = root.offsetHeight;

      if(that.props.feed.localLabbooks){
        if ((distanceY > expandOn) && !isLoadingMore && that.props.feed.localLabbooks.pageInfo.hasNextPage) {
            that._loadMore(e);
        }
      }
    });
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
  *  @param {event} e
  *  loads more labbooks using the relay pagination container
  */
  _loadMore = (e) => {
    isLoadingMore = true
    if(e){
      e.preventDefault();
    }
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

  render(){

      let {props} = this;
      let owner = localStorage.getItem('username')

      if(props.feed.localLabbooks){

        let labbooks = this._filterLabbooks(props.feed.localLabbooks.edges, this.state.filter)

        return(

          <div className="LocalLabbooks">


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
            <div className="LocalLabbooks__menu">
              <nav className="LocalLabbooks__nav">
                <div className={this.state.filter === 'all' ? 'LocalLabbooks__nav-item selected' : 'LocalLabbooks__nav-item' }>
                  <a onClick={()=> this._setFilter('all')}>All</a>
                </div>
                <div className={this.state.filter === owner ? 'LocalLabbooks__nav-item selected' : 'LocalLabbooks__nav-item' }>
                  <a onClick={()=> this._setFilter(owner)}>My LabBooks</a>
                </div>
                <div className={this.state.filter === 'others' ? 'LocalLabbooks__nav-item selected' : 'LocalLabbooks__nav-item' }>
                  <a onClick={()=> this._setFilter('others')}>Shared With Me</a>
                </div>
              </nav>
            </div>
            <div className='LocalLabbooks__labbooks'>
              <div className="LocalLabbooks__sizer">

                <ImportModule
                    ref="ImportModule_localLabooks"
                    {...props}
                    showModal={this._showModal}
                    className="LocalLabbooks__panel LocalLabbooks__panel--import"
                />

                {

                  labbooks.map((edge) => {

                    return (
                      <LocalLabbookPanel
                        key={edge.node.name}
                        ref={'LocalLabbookPanel' + edge.node.name}
                        className="LocalLabbooks__panel"
                        edge={edge}
                        goToLabbook={this._goToLabbook}/>
                    )
                  })
                }
            </div>

          </div>

        </div>
      )
    }else{
      return(<Loader />)
    }

  }
}

export default createPaginationContainer(
  LocalLabbooks,
  {feed: graphql`
      fragment LocalLabbooks_feed on LabbookQuery{
        localLabbooks(first: $first, after:$cursor)@connection(key: "LocalLabbooks_localLabbooks"){
          edges {
            node {
              name
              description
              owner
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
    getConnectionFromProps(props) {
      return props.feed.localLabbooks
    },
    getFragmentVariables(prevVars, first, cursor) {
      return {
        ...prevVars,
        first: first
      };
    },
    getVariables(props, {first, cursor}, fragmentVariables) {
      first = 10;
      cursor = props.feed.localLabbooks.pageInfo.endCursor;
      return {
        first,
        cursor
        // in most cases, for variables other than connection filters like
        // `first`, `after`, etc. you may want to use the previous values.
      };
    },
    query: graphql`
      query LocalLabbooksPaginationQuery(
        $first: Int!
        $cursor: String
      ) {
          ...LocalLabbooks_feed
      }
    `
  }
);

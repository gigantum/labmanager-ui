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
      labbookModalVisible: false,
      oldLabbookName: '',
      newLabbookName:'',
      renameError: '',
      showNamingError: false
    }

    this._goToLabbook = this._goToLabbook.bind(this)
    this._loadMore = this._loadMore.bind(this)
    this._renameLabbookModal = this._renameLabbookModal.bind(this)

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
  _goToLabbook = (labbookName) => {
    this.setState({'labbookName': labbookName})

    this.props.history.replace(`/labbooks/${labbookName}`)
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
    this.props.relay.loadMore(
      10, // Fetch the next 10 feed items
      (ev) => {
        isLoadingMore = false;
      }
    );
  }

  _renameLabbookModal(labbookName){
    this.setState({
      labbookModalVisible: true,
      oldLabbookName: labbookName
    })

    if(document.getElementById('modal__cover')){
      document.getElementById('modal__cover').classList.remove('hidden')
    }
  }

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

  _renameMutation(){
    const username = localStorage.getItem('username')
    let self = this;
    RenameLabbookMutation(
      username,
      this.state.oldLabbookName,
      this.state.newLabbookName,
      (response, error) =>{

        if(error){
          self.setState({renameError: error[0].message})
        }
        if(response.renameLabbook.success){
          if(document.getElementById('modal__cover')){
            document.getElementById('modal__cover').classList.add('hidden')
          }
          self.props.history.replace(`labbooks/${self.state.newLabbookName}`)
        }
      }
    )
  }

  render(){
      let {props} = this;

      if(props.feed.localLabbooks){

        return(
          <div className="LocalLabbooks">
            { this.state.labbookModalVisible &&
              <div className="LocalLabbooks__rename-modal">
                <div
                  onClick={()=> this._closeLabbook()}
                  className="LocalLabbooks__rename-close">
                  X
                </div>
                <input
                  onKeyUp={(evt)=> this._setLabbookTitle(evt)}
                  className="LocalLabbooks__rename-input"
                  type="text"
                  placeholder="New Labbook Name"></input>
                {this.state.showNamingError && <p className="LocalLabbooks__rename-error">Error: Title may only contain alphanumeric characters separated by hyphens. (e.g. lab-book-title)</p>}
                {this.state.renameError && <p className="LocalLabbooks__rename-error">{this.state.renameError}</p>}
                <button
                  disabled={(this.state.newLabbookName.length === 0) && !this.state.showNamingError}
                  className="LocalLabbooks__rename-submit"
                  onClick={()=> this._renameMutation()}>
                  Rename LabBook
                </button>

              </div>
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
            <div className="LocalLabbooks__menu">
              <nav className="LocalLabbooks__nav">
                <div className="LocalLabbooks__nav-item selected"><a>All</a></div>
                <div className="LocalLabbooks__nav-item"><a>My LabBooks</a></div>
                <div className="LocalLabbooks__nav-item"><a>Shared With ME</a></div>
              </nav>
            </div>
            <div className='LocalLabbooks__labbooks'>
              <div className="LocalLabbooks__sizer">
              <div
                key={'addLabbook'}
                onClick={()=> this.refs.wizardModal._showModal()}
                className="LocalLabbooks__panel LocalLabbooks__panel--add">
                <div
                  // onClick={()=> this._openImport()}
                  className="LocalLabbooks__labbook-icon">
                    <div className="LocalLabbooks__title-add"></div>
                </div>
                <div
                  // onClick={()=> this._openImport()}
                  className="LocalLabbooks__add-text">
                    <h4>Create LabBook</h4>
                    <p>Or drag lbk file here to import.</p>
                </div>
              </div>

              <ImportModule
                  ref="ImportModule_localLabooks"
                  {...props}
                  className="LocalLabbooks__panel LocalLabbooks__panel--import" />

              {

                this.props.feed.localLabbooks.edges.map((edge) => {

                  return (
                    <LocalLabbookPanel
                      key={edge.node.name}
                      ref={'LocalLabbookPanel' + edge.node.name}
                      className="LocalLabbooks__panel"
                      edge={edge}
                      renameLabbookModal={this._renameLabbookModal}
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
      fragment LocalLabbooks_feed on Query{
        localLabbooks(first: $first, after:$cursor)@connection(key: "LocalLabbooks_localLabbooks"){
          edges {
            node {
              name
              description
              owner{
                id
                username
              }
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

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




let isLoadingMore = false;

class LocalLabbooks extends Component {

  constructor(props){
  	super(props);

    this._goToLabbook = this._goToLabbook.bind(this)
    this._loadMore = this._loadMore.bind(this)

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

  render(){
      let {props} = this;

      if(props.feed.localLabbooks){

        return(
          <div className="LocalLabbooks">

            <WizardModal
              ref="wizardModal"
              handler={this.handler}
              history={this.props.history}
              {...props}
            />

            <div className="LocalLabbooks__title-bar flex flex--row justify--space-between">
              <h4 className="LocalLabbooks__title" onClick={()=> this.refs.wizardModal._showModal()} >
                Lab Books
                <div className="LocalLabbooks__title-add"></div>
              </h4>

            </div>
            <div className='LocalLabbooks__labbooks'>
              <div className="LocalLabbooks__sizer">
              <div
                key={'addLabbook'}
                onClick={()=> this.refs.wizardModal._showModal()}
                className="LocalLabbooks__panel LocalLabbooks__panel--add flex flex--row justify--center">
                <div
                  // onClick={()=> this._openImport()}
                  className="LocalLabbooks__labbook-icon">
                    <div className="LocalLabbooks__title-add"></div>
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

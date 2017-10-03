import React, { Component } from 'react'
import {
  createPaginationContainer,
  graphql
} from 'react-relay'

import WizardModal from 'Components/wizard/WizardModal'
import Loader from 'Components/shared/Loader'
import LocalLabbookPanel from 'Components/dashboard/labbooks/LocalLabbookPanel'

let localLabbooks;

let isLoadingMore = false;

class LocalLabbooks extends Component {

  constructor(props){
  	super(props);
  	localLabbooks = this;
  }

  componentDidMount() {
    window.addEventListener('scroll', function(e){
      let root = document.getElementById('root')
      let distanceY = window.innerHeight + document.documentElement.scrollTop + 200,
          expandOn = root.offsetHeight;
          console.log(distanceY, expandOn)
      if ((distanceY > expandOn) && !isLoadingMore && localLabbooks.props.feed.localLabbooks.pageInfo.hasNextPage) {
          localLabbooks._loadMore(e);
      }
    });
  }
  /*
    function(string) inputs a labbook name
    routes to that labbook
  */
  _goToLabbook(labbookName){
    localLabbooks.setState({'labbookName': labbookName})

    localLabbooks.props.history.replace(`/labbooks/${labbookName}`)
  }

  /*
    loads
  */
  _loadMore(e){
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

      if(this.props.feed.localLabbooks){
        return(
          <div className="LocalLabbooks">
            <WizardModal
              ref="wizardModal"
              handler={this.handler}
              history={this.props.history}
              {...this.props}
            />
            <h4 className="LocalLabbooks__title" onClick={()=> this.refs.wizardModal._showModal()} >Lab Books <div className="LocalLabbooks__title-add"></div></h4>
            <div className='LocalLabbooks__labbooks flex flex--row flex--wrap justify--left'>

              {

                this.props.feed.localLabbooks.edges.map((edge) => {

                  return (
                    <LocalLabbookPanel key={edge.node.name} className="LocalLabbooks__panel" edge={edge} goToLabbook={this._goToLabbook}/>
                  )
                })
              }

            <div
              key={'addLabbook'}
              onClick={()=> this.refs.wizardModal._showModal()}
              className='LocalLabbooks__panel LocalLabbooks__panel--add flex flex--row justify--center'>
              <div className="LocalLabbooks__labbook-icon">
                  <div className="LocalLabbooks__title-add"></div>
              </div>

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

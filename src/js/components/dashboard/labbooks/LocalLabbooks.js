import React, { Component } from 'react'
import {
  createPaginationContainer,
  graphql
} from 'react-relay'

import WizardModal from 'Components/wizard/WizardModal'
import Loader from 'Components/shared/Loader'

class LocalLabbooks extends Component {
  constructor(props){

    super(props)
    this.handler = this.handler.bind(this)

  }

  handler(e) {
    e.preventDefault()
  }
  /*
    function(string) inputs a labbook name
    routes to that labbook
  */
  _goToLabbook(labbookName){
    this.props.history.replace(`/labbooks/${labbookName}`)
  }

  /*
    loads
  */
  _loadMore(e){
    e.preventDefault();

    this.props.relay.loadMore(
      10, // Fetch the next 10 feed items
      (ev) => {
        console.error(ev);
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
                    <div
                      key={edge.node.name}
                      onClick={() => this._goToLabbook(edge.node.name)}
                      className='LocalLabbooks__panel flex flex--column justify--space-between'>
                        <div className="LocalLabbooks__icon-row">
                          <div className="LocalLabbooks__labbook-icon"></div>
                        </div>
                        <div className="LocalLabbooks__text-row">
                          <h4>{edge.node.name}</h4>
                          <p className="LocalLabbooks__description">{edge.node.description}</p>
                        </div>
                        <div className="LocalLabbooks__info-row flex flex--row">
                          <div className="LocalLabbooks__owner flex flex--row">
                              <div>Owner</div>
                              <div className="LocalLabbooks__owner-icon"></div>
                              {/* <div> {owner.username}</div> */}
                          </div>
                          <div className="LocalLabbooks__status">

                          </div>

                        </div>
                    </div>
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
          <div className={this.props.feed.localLabbooks.pageInfo.hasNextPage ? 'LocalLabbooks__next-button-container' : 'hidden'}>
            <button key="load_more"
              onClick={(e) => this._loadMore(e)}
              title="Load More"
            >
              Next 10
            </button>
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

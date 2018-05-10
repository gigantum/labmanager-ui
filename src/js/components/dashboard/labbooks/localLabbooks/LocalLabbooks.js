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
import LocalLabbookPanel from 'Components/dashboard/labbooks/LocalLabbooks/LocalLabbookPanel'
import ImportModule from 'Components/import/ImportModule'
//Mutations
import RenameLabbookMutation from 'Mutations/RenameLabbookMutation'
//utils
import Validation from 'JS/utils/Validation'

let isLoadingMore = false;

class LocalLabbooks extends Component {
  constructor(props){
    super(props)
    this._captureScroll = this._captureScroll.bind(this)
    this._loadMore = this._loadMore.bind(this)
  }

  componentDidMount() {
    window.addEventListener('scroll', this._captureScroll);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this._captureScroll)
  }

  /**
    *  @param {}
    *  captures scrolling event
  */
  _captureScroll = () => {
    let root = document.getElementById('root')
    let distanceY = window.innerHeight + document.documentElement.scrollTop + 200,
        expandOn = root.offsetHeight;
    if(this.props.localLabbooks.localLabbooks){
      if ((distanceY > expandOn) && !isLoadingMore && this.props.localLabbooks.localLabbooks.pageInfo.hasNextPage) {
        this._loadMore();
      }
    }
  }

  _refetch(sort, reverse){
    let self = this;
    let relay = self.props.relay;
    this.props.changeRefetchState(true)

    relay.refetchConnection(
      20,
      (res, err)=>{
        if(err){
          console.log(err)
        }
        this.props.changeRefetchState(false)

      },
      {first: 20,
        cursor: null,
        sort: sort,
        reverse: reverse,
      }
    )
  }

  /**
    *  @param {}
    *  loads more labbooks using the relay pagination container
  */

  _loadMore = () => {
    isLoadingMore = true

    if(this.props.localLabbooks.localLabbooks.pageInfo.hasNextPage){
      this.props.relay.loadMore(
        10, // Fetch the next 10 items
        (ev) => {
          isLoadingMore = false;
        }
      );
    }
  }

  render(){
    let labbooks = this.props.filterLabbooks(this.props.localLabbooks.localLabbooks.edges, this.props.filterState)
    return(
      <div className='LocalLabbooks__labbooks'>
      <div className="LocalLabbooks__sizer grid">

        <ImportModule
            ref="ImportModule_localLabooks"
            {...this.props}
            showModal={this.props.showModal}
            className="LocalLabbooks__panel column-4-span-3 LocalLabbooks__panel--import"
        />
        {
          labbooks.map((edge) => {
            return (
              <LocalLabbookPanel
                key={edge.node.name}
                ref={'LocalLabbookPanel' + edge.node.name}
                className="LocalLabbooks__panel"
                edge={edge}
                history={this.props.history}
                goToLabbook={this.props.goToLabbook}/>
            )
          })
        }
      </div>
    </div>
    )
  }
}

export default createPaginationContainer(
  LocalLabbooks,
  graphql`
    fragment LocalLabbooks_localLabbooks on LabbookList{
      localLabbooks(first: $first, after: $cursor, sort: $sort, reverse: $reverse)@connection(key: "LocalLabbooks_localLabbooks"){
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
  {
    direction: 'forward',
    getConnectionFromProps(props, error) {
      return props.localLabbooks.localLabbooks
    },
    getFragmentVariables(prevVars, first, cursor) {
      return {
        ...prevVars,
        first: first
      };
    },
    getVariables(props, {first, cursor, sort, reverse}, fragmentVariables) {
      first = 10;
      cursor = props.localLabbooks.localLabbooks.pageInfo.endCursor;
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
      query LocalLabbooksPaginationQuery(
        $first: Int!
        $cursor: String
        $sort: String
        $reverse: Boolean
      ) {
        labbookList{
          ...LocalLabbooks_localLabbooks
        }
      }
    `
  }
);

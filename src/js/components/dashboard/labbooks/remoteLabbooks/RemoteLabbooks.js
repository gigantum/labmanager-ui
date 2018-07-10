//vendor
import React, { Component } from 'react'
import {
  createPaginationContainer,
  graphql
} from 'react-relay'
//components
import RemoteLabbookPanel from 'Components/dashboard/labbooks/remoteLabbooks/RemoteLabbookPanel'
import DeleteLabbook from 'Components/labbook/branchMenu/DeleteLabbook'
import LabbooksPaginationLoader from '../labbookLoaders/LabbookPaginationLoader'
//queries
import UserIdentity from 'JS/Auth/UserIdentity'
//store
import store from 'JS/redux/store'

class RemoteLabbooks extends Component {
  constructor(props){
    super(props)
    this.state = {
      deleteData: {
        remoteId: null,
        remoteOwner: null,
        remoteLabbookName: null,
        existsLocally: null,
      },
      deleteModalVisible: false,
      isPaginating: false,
    }
    this._toggleDeleteModal = this._toggleDeleteModal.bind(this)
    this._loadMore = this._loadMore.bind(this)
  }
  /*
    loads more remote labbooks on mount
  */
  componentDidMount() {
    if(this.props.remoteLabbooks.remoteLabbooks && this.props.remoteLabbooks.remoteLabbooks.pageInfo.hasNextPage){
      this._loadMore()
    }
  }

  /*
    loads more remote labbooks if available
  */
 componentWillReceiveProps(nextProps) {
    if(nextProps.remoteLabbooks.remoteLabbooks && nextProps.remoteLabbooks.remoteLabbooks.pageInfo.hasNextPage){
      this._loadMore()
    }
  }

  /**
    *  @param {}
    *  loads more labbooks using the relay pagination container
  */
  _loadMore = () => {
    UserIdentity.getUserIdentity().then(response => {
      if(response.data){
        if(response.data.userIdentity.isSessionValid){
          this.setState({
            'isPaginating': true
          })

          if(this.props.remoteLabbooks.remoteLabbooks.pageInfo.hasNextPage){
            this.props.relay.loadMore(
              20, // Fetch the next 20 items
              (ev) => {
                this.setState({
                  'isPaginating': false
                })
              }
            );
          }
        } else {
          this.props.forceLocalView();
        }
      }
    })
  }

  /**
    *  @param {object} deleteData
    *  changes the delete modal's visibility and changes the data passed to it
  */

  _toggleDeleteModal(deleteData){
    if(deleteData) {
      this.setState({
        deleteData,
        deleteModalVisible: true,
      })
    } else {
      this.setState({
        deleteData: {
          remoteId: null,
          remoteOwner: null,
          remoteLabbookName: null,
          existsLocally: null,
        },
        deleteModalVisible: false,
      })
    }
  }

  render(){

    if(this.props.remoteLabbooks && this.props.remoteLabbooks.remoteLabbooks !== null){
      let labbooks = this.props.filterLabbooks(this.props.remoteLabbooks.remoteLabbooks.edges, this.props.filterState)
     
      return(
        <div className='LocalLabbooks__labbooks'>
        <div className="LocalLabbooks__sizer grid">
          {
            labbooks.length ?
            labbooks.map((edge) => {
              return (
                <RemoteLabbookPanel
                  toggleDeleteModal={this._toggleDeleteModal}
                  labbookListId={this.props.remoteLabbooksId}
                  key={edge.node.owner + edge.node.name}
                  ref={'LocalLabbookPanel' + edge.node.name}
                  className="LocalLabbooks__panel"
                  edge={edge}
                  history={this.props.history}
                  existsLocally={edge.node.isLocal}
                  />
              )
            })
            :
            !this.state.isPaginating &&
            store.getState().labbookListing.filterText &&
            <div className="Labbooks__no-results">
              <h3>No Results Found</h3>
              <p>Edit your filters above or <span
                onClick={()=> this.props.setFilterValue({target: {value: ''}})}
              >clear
              </span> to try again.</p>
            </div>
          }
          {
            Array(5).fill(1).map((value, index) => {

                return (
                  <LabbooksPaginationLoader
                    key={'LocalLabbooks_paginationLoader' + index}
                    index={index}
                    isLoadingMore={this.state.isPaginating}
                  />
              )
            })
          }
        </div>
        {
          this.state.deleteModalVisible &&
          <DeleteLabbook
            handleClose={() => { this._toggleDeleteModal() }}
            labbookListId={this.props.remoteLabbooksId}
            remoteId={this.state.deleteData.remoteId}
            remoteConnection={'RemoteLabbooks_remoteLabbooks'}
            toggleModal={this._toggleDeleteModal}
            remoteOwner={this.state.deleteData.remoteOwner}
            remoteLabbookName={this.state.deleteData.remoteLabbookName}
            existsLocally={this.state.deleteData.existsLocally}
            remoteDelete={true}
            history={this.props.history}
          />
        }
      </div>
      )
    } else {
      UserIdentity.getUserIdentity().then(response => {
        if(response.data){
          if(!response.data.userIdentity.isSessionValid){
            this.props.auth.login();
          }
        }
      })

      return(<div></div>)
    }
  }
}

export default createPaginationContainer(
  RemoteLabbooks,
  graphql`
    fragment RemoteLabbooks_remoteLabbooks on LabbookList{
      remoteLabbooks(first: $first, after: $cursor, orderBy: $orderBy, sort: $sort)@connection(key: "RemoteLabbooks_remoteLabbooks", filters: []){
        edges {
          node {
            name
            description
            owner
            id
            isLocal
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
      return props.remoteLabbooks.remoteLabbooks
    },
    getFragmentVariables(prevVars, first, cursor) {
      return {
        ...prevVars,
        first: first
      };
    },
    getVariables(props, {first, cursor, orderBy, sort}, fragmentVariables) {
      first = 20;
      cursor = props.remoteLabbooks.remoteLabbooks.pageInfo.endCursor;
      orderBy = fragmentVariables.orderBy;
      sort = fragmentVariables.sort
      return {
        first,
        cursor,
        orderBy,
        sort
        // in most cases, for variables other than connection filters like
        // `first`, `after`, etc. you may want to use the previous values.
      };
    },
    query: graphql`
      query RemoteLabbooksPaginationQuery(
        $first: Int!
        $cursor: String
        $orderBy: String
        $sort: String
      ) {
        labbookList{
          ...RemoteLabbooks_remoteLabbooks
        }
      }
    `
  }
);

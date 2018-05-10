//vendor
import store from 'JS/redux/store'
import React, { Component, Fragment } from 'react'
import ReactDom from 'react-dom'
import {
  createPaginationContainer,
  graphql
} from 'react-relay'
import classNames from 'classnames'
//components
import RemoteLabbookPanel from 'Components/dashboard/labbooks/remoteLabbooks/RemoteLabbookPanel'
import DeleteLabbook from 'Components/labbook/branchMenu/DeleteLabbook'
import LoginPrompt from 'Components/labbook/branchMenu/LoginPrompt'
//environment
import {fetchQuery} from 'JS/createRelayEnvironment'
//queries
import UserIdentity from 'JS/Auth/UserIdentity'

const RemoteLabbooksQuery = graphql`
  query RemoteLabbooksQuery{
    labbookList{
      localLabbooks{
        edges{
          node{
            id
            owner
            name
            description
          }
        }
      }
    }
  }
`;

let isLoadingMore = false;

class RemoteLabbooks extends Component {
  constructor(props){
    super(props)
    this.state = {
      localLabbooks: {},
      deleteData: {
        remoteId: null,
        remoteOwner: null,
        remoteLabbookName: null,
        existsLocally: null,
      },
      deleteModalVisible: false,
      'showLoginPrompt': false,
    }
    this._toggleDeleteModal = this._toggleDeleteModal.bind(this)
    this._closeLoginPromptModal = this._closeLoginPromptModal.bind(this)
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this._captureScroll)
  }

  /**
    * @param {}
    * fires when user identity returns invalid session
    * prompts user to revalidate their session
  */
  _closeLoginPromptModal() {
    this.setState({
      'showLoginPrompt': false
    })
    document.getElementById('modal__cover').classList.add('hidden')
  }

  componentDidMount() {
    fetchQuery(RemoteLabbooksQuery()).then((response) => {
      let localLabbooksObj = {};
      let responseArr = response.data.labbookList.localLabbooks.edges;
      responseArr.forEach((labbook)=> {
        localLabbooksObj[labbook.node.owner] = localLabbooksObj[labbook.node.owner] ? localLabbooksObj[labbook.node.owner].set(labbook.node.name, labbook.node.description) : new Map([[labbook.node.name, labbook.node.description]])
      })
      this.setState({localLabbooks: localLabbooksObj})
    })
    window.addEventListener('scroll', this._captureScroll);
  }

  /**
    *  @param {}
    *  fires when user scrolls
    *  if nextPage exists and user is scrolled down, it will cause loadmore to fire
  */
  _captureScroll = () => {
    let root = document.getElementById('root')
    let distanceY = window.innerHeight + document.documentElement.scrollTop + 200,
        expandOn = root.offsetHeight;
    if(this.props.remoteLabbooks.remoteLabbooks){
      if ((distanceY > expandOn) && !isLoadingMore && this.props.remoteLabbooks.remoteLabbooks.pageInfo.hasNextPage) {
        this._loadMore();
      }
    }
  }

  /**
    * @param {string, boolean} sort reverse
    * fires when parent _refetch function is called
    * causes relay to refetch with new parameters
  */
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
    UserIdentity.getUserIdentity().then(response => {
      if(response.data){
        if(response.data.userIdentity.isSessionValid){
          isLoadingMore = true

          if(this.props.remoteLabbooks.remoteLabbooks.pageInfo.hasNextPage){
            this.props.relay.loadMore(
              10, // Fetch the next 10 items
              (ev) => {
                isLoadingMore = false;
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
    let labbooks = this.props.filterLabbooks(this.props.remoteLabbooks.remoteLabbooks.edges, this.props.filterState)

    const deleteModalCSS = classNames({
      'BranchModal--delete-modal': this.state.deleteModalVisible,
      'hidden': !this.state.deleteModalVisible
    })
    let loginPromptModalCss = classNames({
      'Labbooks--login-prompt': this.state.showLoginPrompt,
      'hidden': !this.state.showLoginPrompt
    })
    return(
      <div className='LocalLabbooks__labbooks'>
      <div className="LocalLabbooks__sizer grid">
        {
          labbooks.map((edge) => {
            return (
              <RemoteLabbookPanel
                toggleDeleteModal={this._toggleDeleteModal}
                labbookListId={this.props.labbookListId}
                key={edge.node.owner + edge.node.name}
                ref={'LocalLabbookPanel' + edge.node.name}
                className="LocalLabbooks__panel"
                edge={edge}
                history={this.props.history}
                existsLocally={this.state.localLabbooks[edge.node.owner] && this.state.localLabbooks[edge.node.owner].has(edge.node.name)}
                localDescription={this.state.localLabbooks[edge.node.owner] && this.state.localLabbooks[edge.node.owner].get(edge.node.name)}
                goToLabbook={this.props.goToLabbook}/>
            )
          })
        }
      </div>
      <div className={deleteModalCSS}>
          <div
            onClick={() => { this._toggleDeleteModal() }}
            className="RemoteLabbooks--close"></div>

          <DeleteLabbook
            labbookListId={this.props.labbookListId}
            remoteId={this.state.deleteData.remoteId}
            remoteConnection={'RemoteLabbooks_remoteLabbooks'}
            toggleModal={this._toggleDeleteModal}
            remoteOwner={this.state.deleteData.remoteOwner}
            remoteLabbookName={this.state.deleteData.remoteLabbookName}
            existsLocally={this.state.deleteData.existsLocally}
            remoteDelete={true}
            history={this.props.history}
          />
        </div>
        <div className={loginPromptModalCss}>
          <div
            onClick={() => { this._closeLoginPromptModal() }}
            className="Labbooks-login-prompt--close"></div>
          <LoginPrompt closeModal={this._closeLoginPromptModal} />
        </div>
    </div>
    )
  }
}

export default createPaginationContainer(
  RemoteLabbooks,
  graphql`
    fragment RemoteLabbooks_remoteLabbooks on LabbookList{
      remoteLabbooks(first: $first, after: $cursor, sort: $sort, reverse: $reverse)@connection(key: "RemoteLabbooks_remoteLabbooks", filters: []){
        edges {
          node {
            name
            description
            owner
            id
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
    getVariables(props, {first, cursor, sort, reverse}, fragmentVariables) {
      first = 10;
      cursor = props.remoteLabbooks.remoteLabbooks.pageInfo.endCursor;
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
      query RemoteLabbooksPaginationQuery(
        $first: Int!
        $cursor: String
        $sort: String
        $reverse: Boolean
      ) {
        labbookList{
          ...RemoteLabbooks_remoteLabbooks
        }
      }
    `
  }
);

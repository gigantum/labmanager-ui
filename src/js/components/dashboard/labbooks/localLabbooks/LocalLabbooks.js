//vendor
import React, { Component } from 'react'
import {
  createPaginationContainer,
  graphql
} from 'react-relay'
//components
import LocalLabbookPanel from 'Components/dashboard/labbooks/localLabbooks/LocalLabbookPanel'
import LabbooksPaginationLoader from '../labbookLoaders/LabbookPaginationLoader'
import ImportModule from 'Components/import/ImportModule'
//helpers
import ContainerLookup from './ContainerLookup'


export class LocalLabbooks extends Component {
  constructor(props){
    super(props)
    this.state = {
      sort: this.props.sort,
      reverse: this.props.reverse,
      isPaginating: false,
      refetchLoading: false,
      containerList: null,
    }

    this._captureScroll = this._captureScroll.bind(this)
    this._loadMore = this._loadMore.bind(this)
    this._refetch = this._refetch.bind(this);
    this._containerLookup = this._containerLookup.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.sort !== this.state.sort || nextProps.reverse !== this.state.reverse) {
      this.setState({sort: nextProps.sort, reverse: nextProps.reverse});
      this._refetch(nextProps.sort, nextProps.reverse);
    }
  }

  componentDidMount() {
    if(!this.props.loading){
      if(this.props.wasSorted) {
      this._refetch(this.state.sort, this.state.reverse);
      }
      this.props.sortProcessed()
      window.addEventListener('scroll', this._captureScroll);
      this._containerLookup();
    }
  }

  _containerLookup(){
    let self = this;
    let idArr = this.props.localLabbooks.localLabbooks.edges.map(edges =>edges.node.id)
    ContainerLookup.query(idArr).then((res)=>{
      if(res && res.data && res.data.labbookList && res.data.labbookList.localById){
        self.setState({containerList: res.data.labbookList.localById})
        this.containerLookup = setTimeout(()=>{
          self._containerLookup()
        }, 10000)
      }
    })
  }


  componentWillUnmount() {
    clearTimeout(this.containerLookup)
    window.removeEventListener("scroll", this._captureScroll)
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
    if(this.props.localLabbooks.localLabbooks){
      if ((distanceY > expandOn) && !this.state.isPaginating && this.props.localLabbooks.localLabbooks.pageInfo.hasNextPage) {
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
    this.setState({refetchLoading: true})
    this.props.changeRefetchState(true)

    relay.refetchConnection(
      20,
      (res, err)=>{
        if(err){
          console.log(err)
        }
        this.setState({refetchLoading: false})
        this.props.changeRefetchState(false)

      },
      {first: 100,
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

    this.setState({
      'isPaginating': true
    })
    if(this.props.localLabbooks.localLabbooks.pageInfo.hasNextPage){
      this.props.relay.loadMore(
        10, // Fetch the next 10 items
        (ev) => {
          this.setState({
            'isPaginating': false
          })
        }
      );
    }
  }

  render(){
    if((this.props.localLabbooks && this.props.localLabbooks.localLabbooks && this.props.localLabbooks.localLabbooks.edges) || this.props.loading){

      let labbooks = !this.props.loading ? this.props.filterLabbooks(this.props.localLabbooks.localLabbooks.edges, this.props.filterState) : [];

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

            !this.state.refetchLoading && labbooks.map((edge, index) => {
              return (
                <LocalLabbookPanel
                  key={edge.node.name}
                  ref={'LocalLabbookPanel' + edge.node.name}
                  className="LocalLabbooks__panel"
                  edge={edge}
                  history={this.props.history}
                  environment={this.state.containerList && this.state.containerList[index].environment}
                  goToLabbook={this.props.goToLabbook}/>
              )
            })
          }
          {
            Array(5).fill(1).map((value, index) => {

                return (
                  <LabbooksPaginationLoader
                    key={'LocalLabbooks_paginationLoader' + index}
                    index={index}
                    isLoadingMore={this.state.isPaginating || this.props.loading ||this.state.refetchLoading}
                  />
              )
            })
          }
        </div>
      </div>
      )

    }else{
      return(<div></div>)
    }
  }
}

export default createPaginationContainer(
  LocalLabbooks,
  graphql`
    fragment LocalLabbooks_localLabbooks on LabbookList{
      localLabbooks(first: $first, after: $cursor, sort: $sort, reverse: $reverse)@connection(key: "LocalLabbooks_localLabbooks", filters: []){
        edges {
          node {
            id
            name
            description
            owner
            creationDateUtc
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

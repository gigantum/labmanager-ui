//vendor
import React, { Component } from 'react'
import {
  createPaginationContainer,
  graphql
} from 'react-relay'
import uuidv4 from 'uuid/v4'
//components
import LocalLabbookPanel from 'Components/dashboard/labbooks/localLabbooks/LocalLabbookPanel'
import LabbooksPaginationLoader from '../labbookLoaders/LabbookPaginationLoader'
import ImportModule from 'Components/import/ImportModule'
//helpers
import ContainerLookup from './ContainerLookup'
import VisibilityLookup from './VisibilityLookup'
//store
import store from 'JS/redux/store'


export class LocalLabbooks extends Component {
  constructor(props){
    super(props)
    this.state = {
      isPaginating: false,
      containerList: new Map(),
      visibilityList: new Map()
    }

    this._captureScroll = this._captureScroll.bind(this)
    this._loadMore = this._loadMore.bind(this)
    this._containerLookup = this._containerLookup.bind(this)
    this._visibilityLookup = this._visibilityLookup.bind(this)
    this._fetchDemo = this._fetchDemo.bind(this)
  }

  /***
  * @param {}
  * adds event listener for pagination and fetches container status
  */
  componentDidMount() {
    if(!this.props.loading){
      window.addEventListener('scroll', this._captureScroll);

      this._containerLookup()
      this._visibilityLookup()

      if(this.props.labbookList &&
         this.props.localLabbooks.localLabbooks &&
         this.props.localLabbooks.localLabbooks.edges &&
         this.props.localLabbooks.localLabbooks.edges.length === 0){

           this._fetchDemo()
      }
    }
  }
  /***
  * @param {}
  * removes event listener for pagination and removes timeout for container status
  */
  componentWillUnmount() {

    clearTimeout(this.containerLookup)

    window.removeEventListener("scroll", this._captureScroll)
  }

  /***
    * @param {integer} count
    * attempts to fetch a demo if no labbooks are present, 3 times
  */
  _fetchDemo(count = 0){
    if(count < 3){
      let self = this;
      let relay = this.props.relay
      setTimeout(()=>{
        relay.refetchConnection(20, (response, error) => {
          if(self.props.localLabbooks.localLabbooks.edges.length > 0){
          self._containerLookup();
          self._visibilityLookup()
          } else {
          self._fetchDemo(count + 1)
          }
        })
      }, 3000)
    }
  }

  /***
  * @param {}
  * calls VisibilityLookup query and attaches the returned data to the state
  */
  _visibilityLookup(){
    let self = this;
    let uuid = uuidv4()

    let idArr = this.props.localLabbooks.localLabbooks.edges.map(edges =>edges.node.id)

    let index = 0

    function query(ids, index){


      let subsetIds = idArr.slice(index, index + 10)

      VisibilityLookup.query(subsetIds).then((res)=>{


        if(res && res.data &&
          res.data.labbookList &&
          res.data.labbookList.localById){

          let visibilityListCopy = new Map(self.state.visibilityList)

          res.data.labbookList.localById.forEach((node) => {

            visibilityListCopy.set(node.id, node)

          })


          if(index < idArr.length){

            index += 10

            query(ids, index)
          }

          self.setState({visibilityList: visibilityListCopy})
        }


       })
     }

     query(idArr, index)
  }


  /***
  * @param {}
  * calls ContainerLookup query and attaches the returned data to the state
  */
  _containerLookup(){
    let self = this;

    let idArr = this.props.localLabbooks.localLabbooks.edges.map(edges =>edges.node.id)

    ContainerLookup.query(idArr).then((res)=>{

      if(res && res.data &&
        res.data.labbookList &&
        res.data.labbookList.localById){

        let containerListCopy = new Map(this.state.containerList)

        res.data.labbookList.localById.forEach((node) => {

          containerListCopy.set(node.id, node)

        })

        self.setState({containerList: containerListCopy})

        this.containerLookup = setTimeout(()=>{
          self._containerLookup()
        }, 10000)
      }

    })
  }

  /**
    *  @param {}
    *  fires when user scrolls
    *  if nextPage exists and user is scrolled down, it will cause loadmore to fire
  */
  _captureScroll = () => {
    let root = document.getElementById('root'),
        distanceY = window.innerHeight + document.documentElement.scrollTop + 200,
        expandOn = root.offsetHeight;

    if(this.props.localLabbooks.localLabbooks){

      if ((distanceY > expandOn) && !this.state.isPaginating &&

      this.props.localLabbooks.localLabbooks.pageInfo.hasNextPage) {

        this._loadMore();

      }
    }
  }

  /**
    *  @param {}
    *  loads more labbooks using the relay pagination container
  */
  _loadMore = () => {
    let self = this
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

          this._visibilityLookup()

        }
      );
    }
  }

  render(){
    let labbookList = this.props.localLabbooks// labbookList is passed as localLabbooks

    if((labbookList && labbookList.localLabbooks && labbookList.localLabbooks.edges) || this.props.loading){

      let labbooks = !this.props.loading ? this.props.filterLabbooks(labbookList.localLabbooks.edges, this.props.filterState) : [];

      const importVisible = (this.props.section === 'local' || !this.props.loading) && !store.getState().labbookListing.filterText;

      return(

        <div className='LocalLabbooks__labbooks'>

          <div className="LocalLabbooks__sizer grid">
            {
              importVisible &&

                <ImportModule
                  ref="ImportModule_localLabooks"
                  {...this.props}
                  showModal={this.props.showModal}
                  history={this.props.history}
                  className="LocalLabbooks__panel column-4-span-3 LocalLabbooks__panel--import"
                />

            }
            {
              labbooks.length ? labbooks.map((edge, index) => {

                let visibility = this.state.visibilityList.has(edge.node.id) ? this.state.visibilityList.get(edge.node.id).visibility : 'loading'
                return (
                  <LocalLabbookPanel
                    key={`${edge.node.owner}/${edge.node.name}`}
                    ref={'LocalLabbookPanel' + edge.node.name}
                    className="LocalLabbooks__panel"
                    edge={edge}
                    history={this.props.history}
                    node={this.state.containerList.has(edge.node.id) && this.state.containerList.get(edge.node.id)}
                    visibility={visibility}
                    goToLabbook={this.props.goToLabbook}/>
                )
              })

              : !this.props.loading && store.getState().labbookListing.filterText &&

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
                      isLoadingMore={this.state.isPaginating || this.props.loading}
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
      localLabbooks(first: $first, after: $cursor, orderBy: $orderBy, sort: $sort)@connection(key: "LocalLabbooks_localLabbooks", filters: []){
        edges {
          node {
            id
            name
            description
            owner
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
    getVariables(props, {first, cursor, orderBy, sort}, fragmentVariables) {
      first = 10;
      cursor = props.localLabbooks.localLabbooks.pageInfo.endCursor;
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
      query LocalLabbooksPaginationQuery(
        $first: Int!
        $cursor: String
        $orderBy: String
        $sort: String
      ) {
        labbookList{
          ...LocalLabbooks_localLabbooks
        }
      }
    `
  }
);

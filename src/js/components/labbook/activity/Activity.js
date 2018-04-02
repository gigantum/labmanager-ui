//vendor
import React, { Component } from 'react'
import {
  createPaginationContainer,
  graphql
} from 'react-relay'
import store from 'JS/redux/store'
//Components
import ActivityCard from './ActivityCard'
import Loader from 'Components/shared/Loader'
import UserNote from './UserNote'
import PaginationLoader from './ActivityLoaders/PaginationLoader'
import CreateBranch from '../branches/CreateBranch';
//utilities
import Config from 'JS/config'
//config
import config from 'JS/config'

//lacoal variables
let pagination = false;
let isLoadingMore = false;

let counter = 5;

class Activity extends Component {
  constructor(props){

  	super(props);
  	this.state = {
      'modalVisible': false,
      'isPaginating': false,
      'selectedNode': null,
    };

    //bind functions here
    this._loadMore = this._loadMore.bind(this)
    this._toggleActivity = this._toggleActivity.bind(this)
    this._hideAddActivity = this._hideAddActivity.bind(this)
    this._handleScroll = this._handleScroll.bind(this)
    this._refetch = this._refetch.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      'isPaginating': false,
    })
  }

  /**
  *  @param {}
  *   add scroll listener
  *   add interval to poll for new activityRecords
  */
  componentDidMount() {

    let activityRecords = this.props.labbook.activityRecords

    window.addEventListener('scroll', this._handleScroll)

    if(this.props.labbook.activityRecords.pageInfo.hasNextPage){
      this._loadMore()
    }

    if(activityRecords.edges && activityRecords.edges.length){
      this._refetch()

    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    window.removeEventListener('scroll', this._handleScroll)
  }

  /**
   * @param {}
   * refetches component looking for new edges to insert at the top of the activity feed
   *
   */
  _refetch(){
    let self = this
    let relay = this.props.relay
    let activityRecords = this.props.labbook.activityRecords


    let cursor =  activityRecords.edges[ activityRecords.edges.length - 1].node.cursor

    relay.refetchConnection(
      counter,
      (response) =>{
        if(!activityRecords.pageInfo.hasNextPage){
          isLoadingMore = false
        }

        setTimeout(function(){

            self._refetch()
        },5000)
      },
      {
        cursor: cursor
      }
    )

  }
  /**
  *  @param {}
  *  pagination container loads more items
  */
  _loadMore() {
    pagination = true
    isLoadingMore = true
    pagination = true
    this.setState({
      'isPaginating': true
    })

    this.props.relay.loadMore(
     counter, // Fetch the next 10 feed items
     error => {
       if(error){
         console.error(error)
       }
       isLoadingMore = false
       this.setState({
         'isPaginating': false
       })
     },{
       name: 'labbook'
     }
   )
   counter += 5
  }
  /**
  *  @param {evt}
  *   handles scolls and passes off loading to pagination container
  *
  */
  _handleScroll(evt){
    let activityRecords = this.props.labbook.activityRecords,
        root = document.getElementById('root'),
        distanceY = window.innerHeight + document.documentElement.scrollTop + 40,
        expandOn = root.scrollHeight;

    if ((distanceY > expandOn) && !isLoadingMore && activityRecords.pageInfo.hasNextPage) {
        this._loadMore(evt);

    }
  }
  /**
  *   @param {array}
  *   loops through activityRecords array and sorts into days
  *   @return {Object}
  */
  _transformActivity(activityRecords){

    let activityTime = {}

    activityRecords.edges.forEach((edge) => {

      let date = (edge.node && edge.node.timestamp) ? new Date(edge.node.timestamp) : new Date()
      let timeHash = date.getYear() + '_' + date.getMonth() + ' _' + date.getDate();
      let newActivityObject = {edge: edge, date: date}
      activityTime[timeHash] ? activityTime[timeHash].push(newActivityObject) : activityTime[timeHash] = [newActivityObject];
    })

    return activityTime
  }

  _toggleActivity(){
    this.setState({
      'modalVisible': !this.state.modalVisible
    })
  }

  _hideAddActivity(){
    this.setState({
      'modalVisible': false
    })
  }

  _toggleRollbackMenu(node) {
    const {status} = store.getState().containerStatus;
    const canEditEnvironment = config.containerStatus.canEditEnvironment(status)
    if(canEditEnvironment) {
      this.setState({selectedNode: node})
      document.getElementById('modal__cover').classList.remove('hidden')
      this.refs.createBranch._showModal();
    } else {
      store.dispatch({
        type: 'UPDATE_CONTAINER_MENU_VISIBILITY',
        payload: {
          containerMenuOpen: true
        }
      })

      store.dispatch({
        type: 'CONTAINER_MENU_WARNING',
        payload: {
          message: 'Stop LabBook before editing the environment. \n Be sure to save your changes.'
        }
      })
    }
  }

  render(){
    let activityRecordsTime = this._transformActivity(this.props.labbook.activityRecords);

    if(!this.props.labbook.activityRecords.pageInfo.hasNextPage){
      isLoadingMore = false;
    }

    if(this.props.labbook){
      return(
        <div key={this.props.labbook} className='Activity'>

          <div key={this.props.labbook + '_labbooks__container'} className="Activity__inner-container flex flex--row flex--wrap justify--space-around">

            <div key={this.props.labbook + '_labbooks__labook-id-container'} className="Activity__sizer flex-1-0-auto">
              <CreateBranch
                ref="createBranch"
                selected={this.state.selectedNode}
                activeBranch={this.props.activeBranch}
              />
              {
                Object.keys(activityRecordsTime).map((k, i) => {

                  return (
                    <div key={k}>

                      <div className="Activity__date-tab flex flex--column justify--space-around">
                        <div className="Activity__date-day">{k.split('_')[2]}</div>
                        <div className="Activity__date-month">{ Config.months[parseInt(k.split('_')[1], 10)] }</div>
                      </div>

                      {
                        (i===0) && (
                          <div className="UserActivity__container">
                            <div className="Activity__user-note"

                              onClick={() => this._toggleActivity()}>
                              <div className={this.state.modalVisible ? 'Activity__user-note--remove' : 'Activity__user-note--add'}></div>
                              <h5>Add Note</h5>

                            </div>
                            <div className={this.state.modalVisible ? 'Activity__add ActivityCard' : 'hidden'}>

                              {
                                (this.state.modalVisible) &&
                                <UserNote
                                  key="UserNote"
                                  labbookId={this.props.labbook.id}
                                  hideLabbookModal={this._hideAddActivity}
                                  {...this.props}
                                />
                              }
                            </div>
                        </div>
                        )
                      }

                      <div key={k + 'card'}>
                        {
                          activityRecordsTime[k].map((obj) => {
                            return (
                              [<ActivityCard
                                key={obj.edge.node.id}
                                edge={obj.edge}
                              />,
                                <div className="Activity__submenu-container">
                                  <div
                                    className="Activity__submenu-circle"
                                  >
                                  </div>
                                  <div className="Activity__submenu-subcontainer">
                                    <h5
                                      className="Activity__rollback-text"
                                      onClick={() => this._toggleRollbackMenu(obj.edge.node)}
                                    >
                                      Rollback to previous state
                                    </h5>
                                  </div>
                                </div>
                              ]
                            )
                          })
                        }

                    </div>

                  </div>)
                })
              }


              {
                Array(5).fill(1).map((value, index) => {

                    return (
                      <PaginationLoader
                        key={'Actvity_paginationLoader' + index}
                        index={index}
                        isLoadingMore={isLoadingMore}
                      />
                  )
                })
              }
            </div>
          </div>

        </div>
      )
    }else{
      return(
        <Loader />
      )
    }
  }
}

/*
  activity pagination container
  contains activity fragment and for query consumption
*/
export default createPaginationContainer(
  Activity,
  {
    labbook: graphql`
      fragment Activity_labbook on Labbook{
        activityRecords(first: $first, after: $cursor) @connection(key: "Activity_activityRecords"){
          edges{
            node{
              id
              commit
              linkedCommit
              type
              show
              importance
              tags
              message
              timestamp
              username
              detailObjects{
                id
                key
                show
                importance
                type
              }
            }
            cursor
          }
          pageInfo{
            endCursor
            hasNextPage
            hasPreviousPage
            startCursor
          }
        }
      }`
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {

        return props.labbook && props.labbook.activityRecords;
    },
    getFragmentVariables(prevVars, first, cursor) {

      return {
       ...prevVars,
       first: first,
     };
   },
   getVariables(props, {count, cursor}, fragmentVariables) {

    const {owner} = props.match.params;
    const name = props.match.params.labbookName
    const first = counter;

    cursor = pagination ? props.labbook.activityRecords.edges[props.labbook.activityRecords.edges.length - 1].cursor : null

    ;
     return {
       first,
       cursor,
       name,
       owner
       // in most cases, for variables other than connection filters like
       // `first`, `after`, etc. you may want to use the previous values.
       //orderBy: fragmentVariables.orderBy,
     };
   },
   query: graphql`
     query ActivityPaginationQuery($name: String!, $owner: String!, $first: Int!, $cursor: String){
       labbook(name: $name, owner: $owner){
         id
         description
         ...Activity_labbook
       }
     }`

  }
)

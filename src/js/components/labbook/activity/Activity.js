//vendor
import React, { Component, Fragment } from 'react'
import {
  createPaginationContainer,
  graphql
} from 'react-relay'
//store
import store from 'JS/redux/store'
//Components
import ActivityCard from './ActivityCard'
import Loader from 'Components/shared/Loader'
import UserNote from './UserNote'
import PaginationLoader from './ActivityLoaders/PaginationLoader'
import CreateBranch from '../branches/CreateBranch';
import NewActivity from './NewActivity'
//config
import config from 'JS/config'


//local variables
let pagination = false;

let counter = 5;

class Activity extends Component {
  constructor(props){

  	super(props);
  	this.state = {
      'modalVisible': false,
      'isPaginating': false,
      'selectedNode': null,
      'createBranchVisible': false,
      'refetchEnabled': false,
      'newActivityAvailable': false,
      'newActivityPolling': false
    };

    //bind functions here
    this._loadMore = this._loadMore.bind(this)
    this._toggleActivity = this._toggleActivity.bind(this)
    this._hideAddActivity = this._hideAddActivity.bind(this)
    this._handleScroll = this._handleScroll.bind(this)
    this._refetch = this._refetch.bind(this)
    this._startRefetch = this._startRefetch.bind(this)
    this._scrollTo = this._scrollTo.bind(this)
    this._stopRefetch = this._stopRefetch.bind(this)
    this._toggleCreateModal = this._toggleCreateModal.bind(this)
    this._getNewActivties = this._getNewActivties.bind(this)
  }

  componentWillReceiveProps(nextProps) {

    let activityRecords = nextProps.labbook.activityRecords

    if(activityRecords.pageInfo.hasNextPage && (activityRecords.edges.length < 3)){
      this.setState({
        'isPaginating': true,
      })
      this._loadMore()
    }else{
      this.setState({
        'isPaginating': false,
      })
    }
  }

  /**
  *  @param {}
  *   add scroll listener
  *   add interval to poll for new activityRecords
  */
  componentDidMount() {

    let activityRecords = this.props.labbook.activityRecords

    window.addEventListener('scroll', this._handleScroll)

    if(activityRecords.pageInfo.hasNextPage && (activityRecords.edges.length < 2)){

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
   * scroll to top of page
   * deletes activity feed in the relay store
   * resets counter
   * calls restart function
   * removes scroll listener
   * @return {}
   */
  _scrollTo(evt){

    if(document.documentElement.scrollTop === 0 ){
      let {relay} = this.props

      let store = relay.environment.getStore()

      this.props.labbook.activityRecords.edges.forEach((edge)=>{
        store._recordSource.delete(edge.node.id)
      })

      counter = 5

      this._startRefetch()

      window.removeEventListener('scroll', this._scrollTo)
    }
  }
  /**
   * @param {}
   * sets scroll listener
   * kicks off scroll to top
   * @return {}
   */
  _getNewActivties(){

    window.addEventListener('scroll', this._scrollTo)

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
  /**
   * @param {}
   * restarts refetch
   * @return {}
   */
  _startRefetch(){
    if(this.state.newActivityPolling){
      this.setState({
        'refetchEnabled': true,
        'newActivityPolling': false,
        'newActivityAvailable': false
      })

      this._refetch();
    }
  }
  /**
   * @param {}
   * stops refetch from firing
   * @return {}
   */
  _stopRefetch(){
    let self = this

    if(!this.state.newActivityPolling){

      this.setState({
        'refetchEnabled': false,
        'newActivityPolling': true,
        'newActivityAvailable': false
      })

      const {labbookName, owner} = store.getState().routes

      let getNewActivity = () =>{

        NewActivity.getNewActivity(labbookName, owner).then((data)=>{

          let firstRecordCommitId = self.props.labbook.activityRecords.edges[0].node.commit
          let newRecordCommitId = data.labbook.activityRecords.edges[0].node.commit

          if(firstRecordCommitId === newRecordCommitId){
            setTimeout(()=>{
               getNewActivity()
            }, 3000)


          }else{

            this.setState({'newActivityAvailable': true})

          }


       }).catch(error => console.log(error))

     }

     getNewActivity()

   }
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

    let cursor = activityRecords.edges[ activityRecords.edges.length - 1].node.cursor

    relay.refetchConnection(
      counter,
      (response) => {

        setTimeout(function(){
            if(self.state.refetchEnabled){
              self._refetch()
            }
        }, 5000)

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
    this.setState({
      'isPaginating': true
    })

    this.props.relay.loadMore(
     5, // Fetch the next 5 feed items
     error => {
       if(error){
         console.error(error)
       }

       this.setState({
         'isPaginating': false
       })
     },{
       name: 'labbook'
     }
   )
   if(this.props.labbook.activityRecords.pageInfo.hasNextPage){
     counter += 5
   }
  }
  /**
  *  @param {evt}
  *   handles scolls and passes off loading to pagination container
  *
  */
  _handleScroll(evt){

    let {isPaginating} = this.state
    let activityRecords = this.props.labbook.activityRecords,
        root = document.getElementById('root'),
        distanceY = window.innerHeight + document.documentElement.scrollTop + 1000,
        expandOn = root.scrollHeight;


    if ((distanceY > expandOn) && !isPaginating && activityRecords.pageInfo.hasNextPage) {
        this._loadMore(evt);
    }

    if((distanceY > 3000)){
      this._stopRefetch()

    }else{
      this._startRefetch()
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
      let timeHash = `${date.getYear()}_${date.getMonth()}_${date.getDate()}`;
      let newActivityObject = {edge: edge, date: date}
      activityTime[timeHash] ? activityTime[timeHash].push(newActivityObject) : activityTime[timeHash] = [newActivityObject];
    })

    return activityTime
  }
  /**
  *   @param {}
  *   toggles activity visibility
  *   @return {}
  */
  _toggleActivity(){
    this.setState({
      'modalVisible': !this.state.modalVisible
    })
  }
  /**
  *   @param {}
  *   hides add activity
  *   @return {}
  */
  _hideAddActivity(){
    this.setState({
      'modalVisible': false
    })
  }
  /**
  *   @param {}
  *   hides add activity
  *   @return {}
  */
  _toggleRollbackMenu(node) {

    const {status} = store.getState().containerStatus;
    const canEditEnvironment = config.containerStatus.canEditEnvironment(status)
    if(canEditEnvironment) {
      this.setState({selectedNode: node})
      document.getElementById('modal__cover').classList.remove('hidden')
      this.setState({createBranchVisible: true})
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

  _toggleCreateModal(){
    this.setState({createBranchVisible: !this.state.createBranchVisible})
  }

  render(){

    if(this.props.labbook){

      let activityRecordsTime = this._transformActivity(this.props.labbook.activityRecords);

      return(
        <div key={this.props.labbook} className='Activity'>

          {
            (!this.state.refetchEnabled && this.state.newActivityAvailable) &&
            <div
              className="Activity__new-record-wrapper column-1-span-9">
             <div
               onClick={() => this._getNewActivties()}
               className="Activity__new-record">
                New Activity
             </div>
           §</div>
          }

          <div key={this.props.labbook + '_labbooks__container'} className="Activity__inner-container flex flex--row flex--wrap justify--space-around">

            <div key={this.props.labbook + '_labbooks__labook-id-container'} className="Activity__sizer flex-1-0-auto">
              <CreateBranch
                ref="createBranch"
                selected={this.state.selectedNode}
                activeBranch={this.props.activeBranch}
                modalVisible={this.state.createBranchVisible}
                toggleModal={this._toggleCreateModal}
              />
              {
                Object.keys(activityRecordsTime).map((k, i) => {

                  return (
                    <div key={k}>

                      <div className="Activity__date-tab column-1-span-1 flex flex--column justify--space-around">
                        <div className="Activity__date-day">{k.split('_')[2]}</div>
                        <div className="Activity__date-month">{ config.months[parseInt(k.split('_')[1], 10)] }</div>
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

                      <div key={`${k}__card`}>
                        {
                          activityRecordsTime[k].map((obj, j) => {
                            let isLastRecordObj = i === Object.keys(activityRecordsTime).length -1;
                            let isLastRecordNode = j === activityRecordsTime[k].length -1;
                            let isLastPage = !this.props.labbook.activityRecords.pageInfo.hasNextPage;
                            return (
                              <div className="ActivtyCard__wrapper" key={obj.edge.node.id}>
                                { ((i !== 0 ) || (j !== 0)) &&
                                  <div className="Activity__submenu-container">
                                  {
                                    (!(isLastRecordObj && isLastRecordNode && isLastPage) && this.props.isMainWorkspace) &&
                                  <Fragment>
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
                                    </Fragment>
                                  }
                                  </div>
                                }
                                <ActivityCard

                                  key={`${obj.edge.node.id}_activity-card`}
                                  edge={obj.edge}
                                />
                              </div>

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
                        isLoadingMore={this.state.isPaginating}
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
    const first = counter

    cursor = pagination ? props.labbook.activityRecords.edges[props.labbook.activityRecords.edges.length - 1].cursor : null

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

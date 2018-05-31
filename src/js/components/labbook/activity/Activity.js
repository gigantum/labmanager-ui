//vendor
import React, { Component, Fragment } from 'react'
import {
  createPaginationContainer,
  graphql
} from 'react-relay'
import classNames from 'classnames'
//store
import store from 'JS/redux/store'
//Components
import ActivityCard from './ActivityCard'
import Loader from 'Components/shared/Loader'
import UserNote from './UserNote'
import PaginationLoader from './ActivityLoaders/PaginationLoader'
import CreateBranch from '../branches/CreateBranch';
import NewActivity from './NewActivity'
import ToolTip from 'Components/shared/ToolTip'
//config
import config from 'JS/config'


//local variables
let pagination = false;

let counter = 5;
let isMounted = false

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
      'newActivityPolling': false,
      'editorFullscreen': false,
      'hoveredRollback': null,
      'expandedClusterObject': new Set(),
      'newActivityForcePaused': false,
      'refetchForcePaused': false,
      'activityRecords': this._transformActivity(this.props.labbook.activityRecords)
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
    this._changeFullscreenState = this._changeFullscreenState.bind(this)
    this._handleVisibilityChange = this._handleVisibilityChange.bind(this)
    this._transformActivity = this._transformActivity.bind(this)
    this._countUnexpandedRecords = this._countUnexpandedRecords.bind(this)
  }

  componentWillReceiveProps(nextProps) {

    let activityRecords = nextProps.labbook.activityRecords
    if(JSON.stringify(this._transformActivity(activityRecords)) !== JSON.stringify(this.state.activityRecords)) {
      this.setState({activityRecords: this._transformActivity(activityRecords)})
    }

    if(activityRecords.pageInfo.hasNextPage && (activityRecords.edges.length < 3)){
      this._loadMore()
    }
  }

  /**
  *  @param {}
  *   add scroll listener
  *   add interval to poll for new activityRecords
  */
  componentDidMount() {

    isMounted = true

    let activityRecords = this.props.labbook.activityRecords

    window.addEventListener('scroll', this._handleScroll)
    window.addEventListener('visibilitychange', this._handleVisibilityChange)
    if((activityRecords.pageInfo.hasNextPage && activityRecords.edges.length < 2)){

      this._loadMore()
    } else {
      if(activityRecords.pageInfo.hasNextPage && this._countUnexpandedRecords() < 7){
        this._loadMore()
      }
    }

    if(activityRecords.edges && activityRecords.edges.length){

      this.setState({'refetchEnabled': true})
      this._refetch()

    }

  }

  componentWillUnmount() {
    clearInterval(this.interval);
    clearTimeout(this.refetchTimeout)
    clearTimeout(this.newActivityTimeout)
    isMounted = false

    window.removeEventListener('visibilitychange', this._handleVisibilityChange)
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
   * handles refiring new activity query if visibility changes back to visible
   * @return {}
   */
  _handleVisibilityChange() {
    if(this.state.newActivityForcePaused) {
      this._stopRefetch()
      this.setState({newActivityForcePaused: false})
    } else if(this.state.refetchForcePaused) {
      this._refetch()
      this.setState({refetchForcePaused: false})
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

            self.newActivityTimeout = setTimeout(()=>{
                if(isMounted && document.visibilityState === 'visible' && !this.state.refetchEnabled){
                  getNewActivity()
                } else if (isMounted && document.visibilityState !== 'visible' && !this.state.refetchEnabled) {
                  this.setState({newActivityForcePaused: true, newActivityPolling: false})
                }
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

    let cursor = activityRecords.edges.node ? activityRecords.edges[ activityRecords.edges.length - 1].node.cursor : null

    relay.refetchConnection(
      counter,
      (response, error) => {
        self.refetchTimeout = setTimeout(function(){
            if(self.state.refetchEnabled && isMounted && document.visibilityState === 'visible'){
              self._refetch()
            } else if(self.state.refetchEnabled && isMounted && document.visibilityState !== 'visible') {
              self.setState({refetchForcePaused: true})
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
    let self = this;
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
       if(this.props.labbook.activityRecords.pageInfo.hasNextPage && this._countUnexpandedRecords() < 7){
        self._loadMore();
       } else{
        this.setState({
          'isPaginating': false
        })
       }
     },{
       name: 'labbook'
     }
   )
   if(this.props.labbook.activityRecords.pageInfo.hasNextPage){
     counter += 5
   }
  }

  /**
  *  @param {}
  *  counts visible non clustered activity records
  */
  _countUnexpandedRecords(){
    let records = this.props.labbook.activityRecords.edges;
    let hiddenCount = 0;
    let recordCount = 0;
    let visibleRecords = records.filter((record) => {
      if(record){
        if(!record.node.show){
          hiddenCount++;
        } else {
          if(hiddenCount > 2){
            hiddenCount = 0;
            recordCount++;
          }
        }
      }
      return record && record.node && record.node.show
    })
    if(hiddenCount > 0) {
      recordCount ++;
    }
    return visibleRecords.length + recordCount;
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

    let count = 0;
    let previousTimeHash = null;

    activityRecords.edges.forEach((edge, index) => {

      if(edge && edge.node){
        let date = (edge.node && edge.node.timestamp) ? new Date(edge.node.timestamp) : new Date()
        let timeHash = `${date.getYear()}_${date.getMonth()}_${date.getDate()}`;
        count = edge.node.show || (previousTimeHash && timeHash !== previousTimeHash) ? 0 : count + 1;
        previousTimeHash = timeHash;

        let newActivityObject = {edge: edge, date: date, collapsed: (count > 2 && ((this.state && !this.state.expandedClusterObject.has(index)) || (!this.state))), flatIndex: index}

        if(count > 2 && ((this.state && !this.state.expandedClusterObject.has(index)) || (!this.state)) ){
          activityTime[timeHash][activityTime[timeHash].length - 1].collapsed =  true;
          activityTime[timeHash][activityTime[timeHash].length - 2].collapsed =  true;
        }

        activityTime[timeHash] ? activityTime[timeHash].push(newActivityObject) : activityTime[timeHash] = [newActivityObject];
      }
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

  /**
  *   @param {}
  *   toggle create branch modal visibility
  *   @return {}
  */

  _toggleCreateModal(){
    this.setState({createBranchVisible: !this.state.createBranchVisible})
  }

  /**
  *   @param {}
  *   opens create branch modal and also sets selectedNode to null
  *   @return {}
  */
  _createBranch(){
    const {status} = store.getState().containerStatus;
    const canEditEnvironment = config.containerStatus.canEditEnvironment(status)
    if(canEditEnvironment){
      document.getElementById('modal__cover').classList.remove('hidden')
      this.setState({createBranchVisible: true, selectedNode: null})
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
          message: 'Stop LabBook before creating branches. \n Be sure to save your changes.'
        }
      })
    }
  }

  /**
  *   @param {boolean} isFullscreen
  *   Changes editorFullscreen in state to true if isFullscreen is true, else it swaps existing state
  *   @return {}
  */
  _changeFullscreenState(isFullscreen) {
    if(isFullscreen){
      this.setState({editorFullscreen: isFullscreen})
    } else {
      this.setState({editorFullscreen: !this.state.editorFullscreen})
    }
  }

  /**
  *   @param {array} clusterElements
  *   modifies expandedClusterObject from state
  *   @return {}
  */
  _deleteCluster(clusterElements){
    let newExpandedClusterObject = new Set(this.state.expandedClusterObject)
    if (newExpandedClusterObject !== {}){
      clusterElements.forEach((val) => {
        newExpandedClusterObject.add(val)
      })
    }
    this.setState({expandedClusterObject: newExpandedClusterObject}, ()=> {
      this.setState({activityRecords: this._transformActivity(this.props.labbook.activityRecords)})
    })
  }

  /**
  *   @param {event} evt
  *   assigns open-menu class to parent element and ActivityExtended to previous element
  *   @return {}
  */
  _toggleSubmenu(evt){
    let submenu = evt.target.parentElement;
    let wrapper = submenu && submenu.parentElement;
    if(wrapper.previousSibling){
     wrapper.previousSibling.className.indexOf('ActivityExtended') !== -1 ? wrapper.previousSibling.classList.remove('ActivityExtended')  :wrapper.previousSibling.classList.add('ActivityExtended')
    } else {
      wrapper.parentElement.previousSibling.className.indexOf('ActivityExtended') !== -1 ?wrapper.parentElement.previousSibling.classList.remove('ActivityExtended') : wrapper.parentElement.previousSibling.classList.add('ActivityExtended')
    }
    submenu.className.indexOf('open-menu') !== -1 ? submenu.classList.remove('open-menu') : submenu.classList.add('open-menu')
  }

  /**
  *   @param {object, array, integer, integer, integer} obj, clusterElements, i, j, k
  *   resets clusterElements
  *   returns visible activity cards and their submenus
  *   @return {jsx}
  */

  _visibleCardRenderer(obj, clusterElements, i, j, k){
    clusterElements = [];
    let isLastRecordObj = i === Object.keys(this.state.activityRecords).length -1;
    let isLastRecordNode = j === this.state.activityRecords[k].length -1;
    let isLastPage = !this.props.labbook.activityRecords.pageInfo.hasNextPage;
    let rollbackableDetails = obj.edge.node.detailObjects.filter((detailObjs) => {
      return detailObjs.type !== 'RESULT' && detailObjs.type !=='CODE_EXECUTED';
    })
    return (
      <div className="ActivtyCard__wrapper"  key={obj.edge.node.id}>
        { ((i !== 0 ) || (j !== 0)) &&
          <div className="Activity__submenu-container">
          {
            (!(isLastRecordObj && isLastRecordNode && isLastPage) && this.props.isMainWorkspace && !!rollbackableDetails.length) &&
          <Fragment>
            <ToolTip section="activitySubmenu"/>
            <div
                className="Activity__submenu-circle"
                onClick={(evt)=>this._toggleSubmenu(evt)}
              >
              </div>
              <div className="Activity__submenu-subcontainer">
                <div
                  className="Activity__rollback"
                  onMouseOver={() => this.setState({hoveredRollback: obj.flatIndex})}
                  onMouseOut={() => this.setState({hoveredRollback : null})}
                  onClick={() => this._toggleRollbackMenu(obj.edge.node)}
                >
                  <button
                    className="Activity__rollback-button"
                  >
                  </button>
                  <h5
                    className="Activity__rollback-text"
                  >
                    Rollback
                  </h5>
                </div>
              </div>
            </Fragment>
          }
          </div>
        }
        <ActivityCard
          collapsed={obj.collapsed}
          clusterObject={this.state.clusterObject}
          position={obj.flatIndex}
          hoveredRollback={this.state.hoveredRollback}
          key={`${obj.edge.node.id}_activity-card`}
          edge={obj.edge}
        />
      </div>
    )
  }

  /**
  *   @param {object, array, integer, integer, integer} obj, clusterElements, i, j, k
  *   appends to clusterElements
  *   creates a cluster card that replaces multiple repeating minor activities
  *   @return {jsx}
  */
  _cardClusterRenderer(obj, clusterElements, i, j, k){
    let shouldBeFaded = this.state.hoveredRollback > obj.flatIndex
    let clusterCSS = classNames({
      'ActivityCard--cluster': true,
      'column-1-span-9': true,
      'faded': shouldBeFaded,
    });
    clusterElements.push(obj.flatIndex)
    let clusterRef = clusterElements.slice()
    if(this.state.activityRecords[k][j+1] && this.state.activityRecords[k][j+1].collapsed){
      return undefined;
    }
    return (
      <div className="ActivtyCard__wrapper" key={obj.flatIndex}>
      {
        (clusterElements[0] !== 0) &&
        <div className="Activity__submenu-container">
        </div>
      }
      <div className={clusterCSS} ref={'cluster--'+ obj.flatindex}>
        {clusterElements.length} Minor Activities <ToolTip section="activityCluster"/>
        <div className="ActivityCard__ellipsis" onClick={()=> this._deleteCluster(clusterRef, i)}></div>
      </div>
    </div>
    )
  }

  /**
  *   @param {} obj
  *   renders usernote and it's menu
  *   @return {jsx}
  */

  _renderUserNote(){
    let userActivityContainerCSS = classNames({
      'UserActivity__container': true,
      'fullscreen': this.state.editorFullscreen
    })
    return(
      <div className={userActivityContainerCSS}>
      <div className="Activity__user-note">
        <ToolTip section="userNote"/>
        <div
          className="Activity__user-note-menu-icon"
          onClick={this.state.modalVisible ? (evt)=> {
            this._toggleActivity();
            this._toggleSubmenu(evt)
          } : (evt) => this._toggleSubmenu(evt) }
        >
        </div>
        <div className="Activity__user-note-menu">
          <div className="Activity__add-note">
            <button
              className={this.state.modalVisible ? 'Activity__hide-note-button' : 'Activity__add-note-button'}
              onClick={() => this._toggleActivity()}
            >
            </button>
            <h5>Add Note</h5>
          </div>
          <div className="Activity__add-branch">
            <button
              className="Activity__add-branch-button"
              onClick={()=> this._createBranch()}
            >
            </button>
            <h5>Add Branch</h5>
          </div>
        </div>
      </div>
      <div className={this.state.modalVisible ? 'Activity__add ActivityCard' : 'hidden'}>
        <UserNote
          key="UserNote"
          labbookId={this.props.labbook.id}
          hideLabbookModal={this._hideAddActivity}
          changeFullScreenState={this._changeFullscreenState}
          {...this.props}
        />
      </div>
  </div>
    )
  }

  render(){
    let activityCSS = classNames({
      'Activity': true,
      'fullscreen': this.state.editorFullscreen
    })

    if(this.props.labbook){


      return(
        <div key={this.props.labbook} className={activityCSS}>
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
                Object.keys(this.state.activityRecords).map((k, i) => {
                  let clusterElements = [];
                  return (
                    <div key={k}>
                      <div className="Activity__date-tab column-1-span-1 flex flex--column justify--space-around">
                        <div className="Activity__date-day">{k.split('_')[2]}</div>
                        <div className="Activity__date-month">{ config.months[parseInt(k.split('_')[1], 10)] }</div>
                      </div>
                      {
                        (i===0) && this._renderUserNote()
                      }
                      <div key={`${k}__card`}>
                        {
                          this.state.activityRecords[k].map((obj, j) => {
                            if(!obj.collapsed){
                              return this._visibleCardRenderer(obj, clusterElements, i, j, k);
                            } else {
                              return this._cardClusterRenderer(obj, clusterElements, i, j, k)
                            }
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

//vendor
import React, { Component } from 'react'
import {
  createPaginationContainer,
  graphql
} from 'react-relay'
//Components
import ActivityCard from './ActivityCard'
import Loader from 'Components/shared/Loader'
import UserNote from './UserNote'

//utilities
import Config from 'JS/config'

//lacoal variables
let pagination = false;
let isLoadingMore = false;

let counter = 5;

class Activity extends Component {
  constructor(props){
  	super(props);
  	this.state = {
      'modalVisible': false,
      'isPaginting': false
    };
    this._loadMore = this._loadMore.bind(this)
    this._toggleActivity = this._toggleActivity.bind(this)
    this._hideAddActivity = this._hideAddActivity.bind(this)
    this._handleScroll = this._handleScroll.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      'isPaginting': false
    })
  }

  /**
  *  @param {}
  *   add scroll listener
  *   add interval to poll for new activityRecords
  */
  componentDidMount() {

    let activityRecords = this.props.labbook.activityRecords
    let self = this;
    window.addEventListener('scroll', this._handleScroll);

    if(this.props.labbook.activityRecords.pageInfo.hasNextPage){
      this._loadMore()
    }

    let relay = this.props.relay;
    let activity = this.props.labbook.activityRecords
    if(activity.edges){
      let cursor =  activity.edges[0].cursor;
      pagination = false;
      setInterval(function(){
        relay.refetchConnection(
          counter,
          (response) =>{
            if(!self.props.labbook.activityRecords.pageInfo.hasNextPage){
              isLoadingMore = false;
            }
          },
          {
            cursor: cursor
          }
        )
      }, 3000);
    }
  }

  componentWillUnmount() {

    window.removeEventListener('scroll', this._handleScroll);
  }
  /**
  *  @param {}
  *  pagination container loads more items
  */
  _loadMore() {
    pagination = true
    isLoadingMore = true
    pagination = true;
    this.setState({
      'isPaginting': true
    })

    this.props.relay.loadMore(
     counter, // Fetch the next 10 feed items
     e => {
       isLoadingMore = false;
       this.setState({
         'isPaginting': false
       })
     },{
       name: 'labbook'
     }
   );
   counter += 5
  }
  /**
  *  @param {evt}
  *   handles scolls and passes off loading to pagination container
  *
  */
  _handleScroll(evt){
    let activityRecords = this.props.labbook.activityRecords
    let root = document.getElementById('root')

    let distanceY = window.innerHeight + document.documentElement.scrollTop + 40,
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

              {
                Object.keys(activityRecordsTime).map((k, i) => {

                  return (
                    <div key={k}>


                      <div className="Activity__date-tab flex flex--column justify--space-around">
                        <div className="Activity__date-day">{k.split('_')[2]}</div>
                        <div className="Activity__date-month">{ Config.months[parseInt(k.split('_')[1])] }</div>
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
                                  labbookId={this.props.labbook.id}
                                  {...this.props}
                                  labbookName={this.props.labbookName}
                                  hideLabbookModal={this._hideAddActivity}/>
                              }
                            </div>
                        </div>
                        )
                      }

                      <div key={k + 'card'}>

                        {
                          activityRecordsTime[k].map((obj) => {
                          return(<ActivityCard
                              labbookName={this.props.labbookName}
                              key={obj.edge.node.id}
                              edge={obj.edge}
                            />)

                          })
                        }

                    </div>

                  </div>)
                })
              }
              <div
                key="Activity-loader-card-1"
                className={isLoadingMore ? 'ActivityCard ActivityCard__loader ActivityCard__loader--1 card': 'ActivityCard ActivityCard__loader-hidden'}>
              </div>
              <div
                key="Activity-loader-card-2"
                className={isLoadingMore ? 'ActivityCard ActivityCard__loader ActivityCard__loader--2 card': 'ActivityCard ActivityCard__loader-hidden'}>
              </div>
              <div
                key="Activity-loader-card-3" className={isLoadingMore ? 'ActivityCard ActivityCard__loader ActivityCard__loader--3 card': 'ActivityCard ActivityCard__loader-hidden'}>
              </div>
              <div
                key="Activity-loader-card-4"
                 className={isLoadingMore ? 'ActivityCard ActivityCard__loader ActivityCard__loader--4 card': 'ActivityCard ActivityCard__loader-hidden'}>
              </div>
              <div
                key="Activity-loader-card-5" className={isLoadingMore ? 'ActivityCard ActivityCard__loader ActivityCard__loader--5 card': 'ActivityCard ActivityCard__loader-hidden'}>
              </div>
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
   getVariables(props, {count, cursor, name, owner}, fragmentVariables) {

    const username = localStorage.getItem('username')
    cursor = pagination ? props.labbook.activityRecords.edges[props.labbook.activityRecords.edges.length - 1].cursor : null
    let first = counter;
    name = props.labbookName;
    owner = username;
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

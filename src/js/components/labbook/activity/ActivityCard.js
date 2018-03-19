//vendor
import React, { Component } from 'react'
import classNames from 'classnames'
//images
import userSVG from 'Images/icons/user.svg'
//components
import ActivityDetails from 'Components/labbook/activity/ActivityDetails'

export default class ActivityCard extends Component {
  constructor(props){
    super(props)

    this.state = {
      showExtraInfo: props.edge ? props.edge.node.show : true
    }

    this._toggleExtraInfo = this._toggleExtraInfo.bind(this)
  }

  /**
  *   @param {}
  *  reverse state of showExtraInfo
  */
  _toggleExtraInfo = () => {
    this.setState({showExtraInfo: !this.state.showExtraInfo})
  }
  /**
    @param {string} timestamp
    if input is undefined. current time of day is used
    inputs a time stamp and return the time of day HH:MM am/pm
    @return {string}
  */
  _getTimeOfDay(timestamp){

    let time = (timestamp !== undefined) ? new Date(timestamp) : new Date();
    return ((time.getHours()%12 === 0) ? 12 : time.getHours()%12) + ':' + ((time.getMinutes() > 9) ? time.getMinutes() : '0' + time.getMinutes()) + (time.getHours() > 12 ? 'pm' : 'am');
  }
  /**
    @param {string} freeText
    use SimpleMDE to get html of markdown
    @return {html}
  */

  render(){
    let activityDetailsProps = {};
    if (this.props.edge) {
      var node = this.props.edge.node;
      var type = this.props.edge.node.type.toLowerCase()
      activityDetailsProps = {
        edge: this.props.edge,
        show: this.state.showExtraInfo,
        key: node.id + '_activity-details',
        node: node
      }
    }
    let activityCardCSS = classNames({
      'ActivityCard card' : this.state.showExtraInfo,
      'ActivityCard--collapsed card': !this.state.showExtraInfo
    })
    return(
      <div className={activityCardCSS}>
        <div className={'fa ActivityCard__badge ActivityCard__badge--' + type}>
        </div>
        <div className="ActivityCard__content">
          <div className="ActivityCard__title flex flex--row justify--space-between">
            <div className="ActivityCard__stack">
              <p className="ActivityCard__time">
                {this.props.edge ? this._getTimeOfDay(this.props.edge.node.timestamp) : '12:00pm'}
              </p>
              <img alt='User' src={userSVG} className="ActivityCard__user" />
            </div>
            <h6 className="ActivityCard__commit-message">
              {this.props.edge && this.props.edge.node.username + ': ' + this.props.edge.node.message}
            </h6>
          </div>
          { !this.state.showExtraInfo && this.props.edge &&
            <div className="ActivityCard__ellipsis" onClick={()=>{this._toggleExtraInfo()}}></div>
          }
          { this.state.showExtraInfo &&
            <ActivityDetails
              {...activityDetailsProps}
            />
          }
        </div>
      </div>
    )
  }
}

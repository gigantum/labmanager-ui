//vendor
import React, { Component } from 'react'
//images
import userSVG from 'Images/icons/user.svg'
//components
import ActivityDetails from 'Components/labbook/activity/ActivityDetails'

export default class ActivityCard extends Component {
  constructor(props){

    super(props);
    if(props.edge) {
      this.state = {
        showExtraInfo: props.edge.node.show
      }
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
    if(this.props.edge){
      const node = this.props.edge.node;
      const type = this.props.edge.node.type.toLowerCase()

      return(
        <div className={this.state.showExtraInfo ? 'ActivityCard card': 'ActivityCard--collapsed card'}>
          <div className={'fa ActivityCard__badge ActivityCard__badge--' + type}>
          </div>
          <div className="ActivityCard__content">
            <div className="ActivityCard__title flex flex--row justify--space-between">
              <div className="ActivityCard__stack">
                <p className="ActivityCard__time">
                  {this._getTimeOfDay(this.props.edge.node.timestamp)}
                </p>
                <img alt='User' src={userSVG} className="ActivityCard__user" />
              </div>
              <h6 className="ActivityCard__commit-message">{this.props.edge.node.username + ': ' + this.props.edge.node.message}</h6>
            </div>
            { !this.state.showExtraInfo &&
              <div className="ActivityCard__ellipsis" onClick={()=>{this._toggleExtraInfo()}}></div>
            }
            { this.state.showExtraInfo &&
              <ActivityDetails
                edge={this.props.edge}
                show={this.state.showExtraInfo}
                key={node.id + '_activity-details'}
                node={node}
              />
            }
          </div>
        </div>
      )
    } else {
      return (
        <div>
          <div className={'ActivityCard--collapsed card'}>
            <div className={'fa ActivityCard__badge ActivityCard__badge--environment'}>
            </div>
            <div className="ActivityCard__content">
              <div className="ActivityCard__title flex flex--row justify--space-between">
                <div className="ActivityCard__stack">
                  <p className="ActivityCard__time">
                    12:00pm
                  </p>
                  <img alt='User' src={userSVG} className="ActivityCard__user" />
                </div>
                <h6 className="ActivityCard__commit-message"></h6>
              </div>
            </div>
          </div>
          <div className={'ActivityCard card'}>
            <div className={'fa ActivityCard__badge ActivityCard__badge--code'}>
            </div>
            <div className="ActivityCard__content">
              <div className="ActivityCard__title flex flex--row justify--space-between">
                <div className="ActivityCard__stack">
                  <p className="ActivityCard__time">
                    12:00pm
                  </p>
                  <img alt='User' src={userSVG} className="ActivityCard__user" />
                </div>
                <h6 className="ActivityCard__commit-message"></h6>
              </div>
              <ActivityDetails/>
            </div>
          </div>
        </div>
      )
    }
  }
}

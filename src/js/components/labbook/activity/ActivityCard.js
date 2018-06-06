//vendor
import React, { Component } from 'react'
import classNames from 'classnames'

//components
import ActivityDetails from 'Components/labbook/activity/ActivityDetails'

export default class ActivityCard extends Component {
  constructor(props){
    super(props);
    let showDetails = this.props.edge.node.show && this.props.edge.node.detailObjects.filter((details) => {
      return details.show
    }).length !== 0
    this.state = {
      showExtraInfo: showDetails,
      show: true,
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
    let hour = (time.getHours() % 12 === 0) ? 12 : time.getHours() % 12;
    let minutes = (time.getMinutes() > 9) ? time.getMinutes() : '0' + time.getMinutes();
    let ampm = time.getHours() >= 12 ? 'pm' : 'am';
    return `${hour}:${minutes}${ampm}`
  }
  /**
    @param {string} freeText
    use SimpleMDE to get html of markdown
    @return {html}
  */

  render(){
    const node = this.props.edge.node;
    const type = this.props.edge.node.type.toLowerCase()
    let shouldBeFaded = this.props.hoveredRollback > this.props.position
    const activityCardCSS = classNames({
      'ActivityCard card': this.state.showExtraInfo,
      'ActivityCard--collapsed card': !this.state.showExtraInfo,
      'column-1-span-10': true,
      'faded': shouldBeFaded,
    })
    const titleCSS = classNames({
      'ActivityCard__title flex flex--row justify--space-between': true,
      'note': type === 'note',
      'open': type === 'note' && this.state.show,
      'closed': type === 'note' && !this.state.show,
    })
    return(
      <div className={activityCardCSS} ref="card">

        <div className={'ActivityCard__badge ActivityCard__badge--' + type}>
        </div>

        <div className="ActivityCard__content">

          <div className={titleCSS}
            onClick={()=>this.setState({show: !this.state.show})}

          >

            <div className="ActivityCard__stack">
              <p className="ActivityCard__time">
                {this._getTimeOfDay(this.props.edge.node.timestamp)}
              </p>
              <div className="ActivityCard__user"></div>
            </div>
            <h6 className="ActivityCard__commit-message">
              <b>{this.props.edge.node.username + ' - '}</b>{this.props.edge.node.message}
            </h6>

          </div>

          { !this.state.showExtraInfo &&

            <div className="ActivityCard__ellipsis" onClick={()=>{this._toggleExtraInfo()}}></div>

          }
          { this.state.showExtraInfo && (type !== 'note' || this.state.show)&&
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
  }
}

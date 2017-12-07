//vendor
import React, { Component } from 'react'
import dateformat from 'dateformat'
import ReactMarkdown from 'react-markdown'
import SimpleMDE from 'simplemde'
import userSVG from 'Images/icons/user.svg'
import ActivityDetails from 'Components/labbook/activity/ActivityDetails'

export default class ActivityCard extends Component {
  constructor(props){
    const level = props.edge.node.level
  	super(props);
    this.state = {
      showExtraInfo: ((level === "AUTO_MAJOR") || (level === "USER_NOTE"))
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

    let tags = (typeof this.props.edge.node.tags === 'string') ? JSON.parse(this.props.edge.node.tags) : this.props.edge.node.tags
    console.log(this.props.edge)

    const node = this.props.edge.node;
    const type = this.props.edge.node.type.toLowerCase()
    return(
        <div className="ActivityCard card">
          <div className={'ActivityCard__badge ActivityCard__badge--' + type}>
          </div>
          <div className="ActivityCard__content">
            <div className="ActivityCard__title flex flex--row justify--space-between">


                <div className="ActivityCard__stack">
                  <p className="ActivityCard__time">
                    {this._getTimeOfDay(this.props.edge.node.timestamp)}
                  </p>
                  <img src={userSVG} className="ActivityCard__user" />
                </div>
                <h6 className="ActivityCard__commit-message">{this.props.edge.node.message}</h6>

            </div>

            {/* {(node.detailObjects.length > 1) && */}

              <ActivityDetails
                labbookName={this.props.labbookName}
                key={node.id + '_activity-details'}
                node={node}
              />
            {/* } */}
            {/* { (node.detailObjects.length < 2) &&

              <div>
                <div className="ActivityCard__details">{node.detailObjects.length + ' details'}</div>
                <ReactMarkdown source={this.props.edge.node.freeText} />
             </div>
            } */}
        </div>
      </div>
    )
  }
}

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
    @param {}
    * determines the appropriate margins for cards when compressing
    @return {object}
  */
  _processCardStyle(){
    let activityCardStyle = {}
    if(this.props.isCompressed){
      if(!this.props.isExpandedHead && !this.props.isExpandedEnd){
        activityCardStyle.marginTop = `-7.5px`
        activityCardStyle.marginBottom = `-7.5px`
      }else if(this.props.isExpandedHead){
        let distance = this.props.attachedCluster.length - 1;
        let calculatedMargin = distance * 7.5;
        activityCardStyle.marginTop = `${calculatedMargin}px`
        activityCardStyle.marginBottom = `-7.5px`
      } else if(this.props.isExpandedEnd){
        let distance = this.props.attachedCluster.length - 1;
        let calculatedMargin = distance * 7.5;
        activityCardStyle.marginTop = `-7.5px`
        activityCardStyle.marginBottom = `${calculatedMargin}px`

      }
    }
    return activityCardStyle
  }


  render(){
    const node = this.props.edge.node;
    const type = node.type && node.type.toLowerCase()
    let shouldBeFaded = this.props.hoveredRollback > this.props.position
    const activityCardCSS = classNames({
      'ActivityCard card': this.state.showExtraInfo,
      'ActivityCard--collapsed card': !this.state.showExtraInfo,
      'faded': shouldBeFaded,
      'ActivityCard__expanded': this.props.isExpandedNode,
      'ActivityCard__compressed': this.props.isCompressed && !this.props.isExpandedEnd
    })
    const titleCSS = classNames({
      'ActivityCard__title flex flex--row justify--space-between': true,
      'open': this.state.showExtraInfo || (type === 'note' && this.state.show),
      'closed': !this.state.showExtraInfo || (type === 'note' && !this.state.show)
    })
    let expandedCSS = classNames({
      'ActivityCard__node': this.props.isExpandedNode && !this.props.isExpandedHead && !this.props.isExpandedEnd,
      'ActivityCard__start-node': this.props.isExpandedHead,
      'ActivityCard__end-node': this.props.isExpandedEnd
    })
    let expandedStyle = this.props.attachedCluster && {
      height: `${110 * (this.props.attachedCluster.length - 1) }px`
    }
    if(this.props.isFirstCard && this.props.attachedCluster){
      expandedStyle.top = '32px';
    }

    let activityCardStyle = this._processCardStyle()

    return(
      <div className="column-1-span-10 ActivityCard__container">
        {
          this.props.isExpandedHead  &&
          <div
            className={expandedCSS}
            ref="expanded"
            style={expandedStyle}
            onClick={()=> this.props.addCluster(this.props.attachedCluster)}
            onMouseOver={()=> this.props.compressExpanded(this.props.attachedCluster)}
            onMouseOut={()=> this.props.compressExpanded(this.props.attachedCluster, true)}
          >
          </div>
        }
        <div className={activityCardCSS} ref="card" style={activityCardStyle}>

          <div className={'ActivityCard__badge ActivityCard__badge--' + type}>
          </div>

          <div className="ActivityCard__content">

            <div className={titleCSS}
              onClick={()=>this.setState({show: !this.state.show, showExtraInfo: !this.state.showExtraInfo})}

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
      </div>
    )
  }
}

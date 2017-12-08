//vendor
import React, { Component } from 'react'
import DetailRecords from './DetailRecords'
export default class ActivityCard extends Component {

  constructor(props){
  	super(props);
    console.log(props)
    this.state = {
      show: props.categorizedDetails.detailObjects[this.props.itemKey][0].show
    }
    this._toggleDetailsList =  this._toggleDetailsList.bind(this)
  }

  /**
  *   @param {}
  *  reverse state of showExtraInfo
  */
  _toggleDetailsList = () => {
    this.setState({show: !this.state.show})
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
    @param {string} key
    formats key into a title
    @return {string}
  */
  _formatTitle(key){
    const tempTitle = key.split('_').join(' ').toLowerCase()
    const title = tempTitle.charAt(0).toUpperCase() + tempTitle.slice(1);
    return title + ' (' + this.props.categorizedDetails.detailObjects[this.props.itemKey].length + ')'
  }

  render(){
    let variables = {
      name: this.props.labbookName,
      keys: this.props.categorizedDetails.detailKeys[this.props.itemKey],
      owner: localStorage.getItem('username')
    }

    let type = this.props.categorizedDetails.detailObjects[this.props.itemKey][0].type.toLowerCase()

    return(

        <div className="ActivityDetail__details">
          <div
            onClick={() => {this._toggleDetailsList()}}
            className={this.state.show ? 'ActivityDetail__details-title ActivityDetail__details-title--open' : 'ActivityDetail__details-title ActivityDetail__details-title--closed'}>

            <div className="ActivityDetail__header">
              <div className={'fa ActivityDetail__badge ActivityDetail__badge--' + type }>
              </div>
              <div className="ActivityDetail__content">
                <p>{this._formatTitle(this.props.itemKey)}</p>
              </div>
            </div>

          </div>
          {this.state.show &&
            <div className="ActivtyDetail_list">
                <DetailRecords variables={variables}/>
            </div>
          }
        </div>
    )
  }
}

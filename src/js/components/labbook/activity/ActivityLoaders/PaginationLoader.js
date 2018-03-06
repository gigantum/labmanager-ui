//vendor
import React, { Component } from 'react'


export default class ActivityCard extends Component {
  render(){
    
    return(
      <div
        key={'Activity-loader-card-' + this.props.index}
        className={this.props.isLoadingMore ? 'ActivityCard ActivityCard__loader ActivityCard__loader--' + this.props.index + ' card': 'ActivityCard ActivityCard__loader-hidden'}>
      </div>
    )
  }
}

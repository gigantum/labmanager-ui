import React, { Component } from 'react'

import downSVG from '../../../../images/icons/down-arrow.svg'
import upSVG from '../../../../images/icons/up-arrow.svg'
//import environment from '../../../createRelayEnvironment'
//import CreateLabbook from './CreateLabbook'


export default class NotesCard extends React.Component {
  constructor(props){
  	super(props);

    this.state = {showExtraInfo: false}
  }

  _toggleExtraInfo(){
    this.setState({showExtraInfo: !this.state.showExtraInfo})
  }

  /*
    function(string): inputs a timestamp
    return (string) returns a string in the for of 'X {seconds, hours, days, months, years} ago'
  */
  _timeAgo(time){
    let units = [
      { name: "second", limit: 60, in_seconds: 1 },
      { name: "minute", limit: 3600, in_seconds: 60 },
      { name: "hour", limit: 86400, in_seconds: 3600  },
      { name: "day", limit: 604800, in_seconds: 86400 },
      { name: "week", limit: 2629743, in_seconds: 604800  },
      { name: "month", limit: 31556926, in_seconds: 2629743 },
      { name: "year", limit: null, in_seconds: 31556926 }
    ];
    let diff = (new Date() - new Date(time)) / 1000;
    if (diff < 5) return "now";

    let i = 0;
    let unit;
    while(unit = units[i++]) {
      if (diff < unit.limit || !unit.limit){
        let displayTime =  Math.floor(diff / unit.in_seconds);
        return displayTime + " " + unit.name + (diff>1 ? "s" : "") + " ago";
      }
    }
  }

  render(){

    return(
        <div className='notes-card__container card'>
          <div className='flex flex--row justify--space-between'>
            <div className='flex flex--column justify--space-between'>
              <p>{this.props.edge.node.message}</p>
              <p>{this._timeAgo(this.props.edge.node.timestamp)}</p>
            </div>
            <div className='flex flex--column justify--space-between'>
              <p>Commit Id: {this.props.edge.node.commit}</p>
              <div className='notes-card__toggle-button' style={!this.state.showExtraInfo ? {'background': 'url(' + downSVG + ') no-repeat'} : {'background': 'url(' + upSVG + ') no-repeat'}} onClick={() => this._toggleExtraInfo()}></div>
            </div>
          </div>
          <div className={this.state.showExtraInfo ? 'notes-card__extra-info' : 'notes-card__extra-info no-height'}>
            <p>Level: {this.props.edge.node.level}</p>
            <p className={this.props.edge.node.level}>Commit Id: {this.props.edge.node.id}</p>
            <p>{this.props.edge.node.linkedCommit}</p>
            <p>{this.props.edge.node.timestamp}</p>
            <div>
              <ul className='notes--card__tags-list flex flex--row flex--wrap'><div>Tags: {' '}</div>{this.props.edge.node.tags.map((tag, index) => {return(<li key={tag+index+this.props.edge.node.commit}>{tag}</li>)})}</ul>
            </div>
          </div>
      </div>
    )
  }
}

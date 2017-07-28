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
  /*
    function(): reverse state of showExtraInfo
  */
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
        <div key={this.props.edge.node.commit + '_notes-card'} className="notes-card__container card">

          <div key={this.props.edge.node.commit + '_notes-card__basic-view'}
              className="notes-card__basic-view flex flex--row justify--space-between">

            <div key={this.props.edge.node.commit + '_notes-card__time-message'}
              className="notes-card__time-message flex flex--column justify--space-between">
              <p key={this.props.edge.node.commit + '_notes-card__message'}>
                {this.props.edge.node.message}
              </p>
              <p key={this.props.edge.node.commit + '_notes-card__time'}>
                {this._timeAgo(this.props.edge.node.timestamp)}
              </p>
            </div>

            <div key={this.props.edge.node.commit + '_notes-card__commit-toggle'}
              className="notes-card__commit-toggle flex flex--column justify--space-between">
              <p key={this.props.edge.node.commit + '_notes-card__commit'}>
                Commit Id: {this.props.edge.node.commit}
              </p>

              <div key={this.props.edge.node.commit + '_notes-card__toggle'}
                  className="notes-card__toggle-button"
                  style={!this.state.showExtraInfo ? {'background': 'url(' + downSVG + ') no-repeat'} : {'background': 'url(' + upSVG + ') no-repeat'}}
                  onClick={() => this._toggleExtraInfo()}
              >
              </div>
            </div>
          </div>

          <div key={this.props.edge.node.commit + '_notes-card__expanded-view'}
            className={this.state.showExtraInfo ? 'notes-card__expanded-view' : 'notes-card__expanded-view no-height'}>
            <p key={this.props.edge.node.commit + '_notes-card__level'}>
              Level: {this.props.edge.node.level}
            </p>
            <p key={this.props.edge.node.commit + '_notes-card__commit-id'}
              className={this.props.edge.node.level}>
              Commit Id: {this.props.edge.node.id}
            </p>
            <p key={this.props.edge.node.commit + '_notes-card__linked-commit'}>
              {this.props.edge.node.linkedCommit}
            </p>
            <p key={this.props.edge.node.commit + '_notes-card__timestamp'}>
              {this.props.edge.node.timestamp}
            </p>

            <div key={this.props.edge.node.commit + '_notes-card__tags-container'}
              className="notes-card__tags-container">
              <ul key={this.props.edge.node.commit + '_notes-card__tags-list'}
                className="notes--card__tags-list flex flex--row flex--wrap">
                <div key={this.props.edge.node.commit + '_notes-card__tags-key'}>Tags: {' '}</div>
                {this.props.edge.node.tags.map((tag, index) => {
                  return(
                    <li
                      key={tag + index + this.props.edge.node.commit}
                    >
                      {tag}
                    </li>)
                  })
                }
              </ul>
            </div>

          </div>

      </div>
    )
  }
}

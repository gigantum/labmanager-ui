import React, { Component } from 'react'
import dateformat from 'dateformat'


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

  _getTimeOfDay(timestamp){
    let time = new Date(timestamp);
    return (time.getHours()%12) + ':' + ((time.getMinutes() > 9) ? time.getMinutes() : '0' + time.getMinutes()) + (time.getHours() > 12 ? 'pm' : 'am');
  }

  render(){
    return(
        <div className="NotesCard card">

          <div className="flex flex--row justify--space-between">
              <p className="NotesCard__time">
                {this._getTimeOfDay(this.props.edge.node.timestamp)}
              </p>
              <p className="NotesCard__commit-message">
                {this.props.edge.node.message}
              </p>

              <div className={!this.state.showExtraInfo ? "NotesCard__toggle-button closed flex justify--space-around": "NotesCard__toggle-button open flex justify--space-around"}
                  onClick={() => this._toggleExtraInfo()}
              >
              Activity Log
              <div className="NotesCard__toggle-icon"></div>
              </div>
          </div>

          <div className={this.state.showExtraInfo ? 'NotesCard__expanded-view' : 'NotesCard__expanded-view no-height'}>
            <p>
              Commit Id: {this.props.edge.node.commit}
            </p>
            <p>
              Level: {this.props.edge.node.level}
            </p>
            <p>
              {this.props.edge.node.linkedCommit}
            </p>
            <p>
              {dateformat(this.props.edge.node.timestamp, "dddd, mmmm dS, yyyy, h:MM:ss TT")}
            </p>

            <div>
              <ul className="NotesCard__tags-list flex flex--row flex--wrap">
                <div>Tags: {' '}</div>
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

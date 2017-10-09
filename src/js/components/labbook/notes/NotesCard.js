//vendor
import React, { Component } from 'react'
import dateformat from 'dateformat'
import ReactMarkdown from 'react-markdown'
import SimpleMDE from 'simplemde'

export default class NotesCard extends Component {
  constructor(props){
    const level = props.edge.node.level
  	super(props);
    this.state = {showExtraInfo: ((level === "AUTO_MAJOR") || (level === "USER_NOTE"))}
  }


  /**
  *   @param {}
  *  reverse state of showExtraInfo
  */
  _toggleExtraInfo(){
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
  _getMarkdown(freeText){
    var SimepleMarkdown = new SimpleMDE();

  }

  render(){

    let tags = (typeof this.props.edge.node.tags === 'string') ? JSON.parse(this.props.edge.node.tags) : this.props.edge.node.tags

    return(
        <div className="NotesCard card">

          <div className="NotesCard__title flex flex--row justify--space-between">
              <p className="NotesCard__time">
                {this._getTimeOfDay(this.props.edge.node.timestamp)}
              </p>
              <h6 className="NotesCard__commit-message">{this.props.edge.node.message}</h6>


              <button className={!this.state.showExtraInfo ? "NotesCard__toggle-button closed flex justify--space-around": "NotesCard__toggle-button open flex justify--space-around"}
              onClick={() => this._toggleExtraInfo()}
              >
                Activity Detail
                <div className="NotesCard__toggle-icon"></div>
              </button>
          </div>

          <div className={this.state.showExtraInfo ? 'NotesCard__expanded-view' : 'NotesCard__expanded-view no-height'}>


          {
            (this.props.edge.node.freeText !== "") &&
            <div id={this.props.edge.node.commit} className="NotesCard__markdown-container">
               {this.props.edge.node.freeText}
            </div>}
            <div className="NotesCard__row flex justify--space-around flex--row">
              <p>
                Id: {this.props.edge.node.commit}
              </p>
              <p>
                Level: {this.props.edge.node.level.replace('_',' ')}
              </p>

              <p>
                {dateformat(this.props.edge.node.timestamp, "dddd, mmmm dS, yyyy, h:MM:ss TT")}
              </p>
            </div>

            <div>
              <ul className="NotesCard__tags-list flex flex--row flex--wrap">
                <div>Tags: {' '}</div>
                {tags.map((tag, index) => {
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

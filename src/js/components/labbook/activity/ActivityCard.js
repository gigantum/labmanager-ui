//vendor
import React, { Component } from 'react'
import dateformat from 'dateformat'
import ReactMarkdown from 'react-markdown'
import SimpleMDE from 'simplemde'
import userSVG from 'Images/icons/user.svg'

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
    return(
        <div className="ActivityCard card">

          <div className="ActivityCard__title flex flex--row justify--space-between">
              <div className="ActivityCard__stack">
                <p className="ActivityCard__time">
                  {this._getTimeOfDay(this.props.edge.node.timestamp)}
                </p>
                <img src={userSVG} className="ActivityCard__user" />
              </div>
              <h6 className="ActivityCard__commit-message">{this.props.edge.node.message}</h6>



              <button className={!this.state.showExtraInfo ? "ActivityCard__toggle-button closed flex justify--space-around": "ActivityCard__toggle-button open flex justify--space-around"}
              onClick={() => this._toggleExtraInfo()}
              >
                Activity Detail
                <div className="ActivityCard__toggle-icon"></div>
              </button>
          </div>
          {(node.detailObjects.length < 2) &&
            <div className="ActivityCard__details">{node.detailObjects.length + ' detail'}</div>

          }
          { (node.detailObjects.length > 1) &&
            <div className="ActivityCard__details">{node.detailObjects.length + ' details'}</div>
          }

          <div className={this.state.showExtraInfo ? 'ActivityCard__expanded-view' : 'ActivityCard__expanded-view no-height'}>


          {
            (this.props.edge.node.freeText !== "") &&
            <div id={this.props.edge.node.commit} className="ActivityCard__markdown-container">
               <ReactMarkdown source={this.props.edge.node.freeText} />
            </div>}

            <div>
              <ul className="ActivityCard__tags-list flex flex--row flex--wrap">
                <div>Tags: {' '}</div>

                { tags && tags.map((tag, index) => {
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

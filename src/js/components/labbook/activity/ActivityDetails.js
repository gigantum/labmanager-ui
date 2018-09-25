// vendor
import React, { Component } from 'react';
import ActivityDetailList from './ActivityDetailList';


export default class ActivityCard extends Component {
  constructor(props) {
  	super(props);
    this.state = {
      showExtraInfo: props.node.show,
      showEllispsis: !props.node.show,
    };

    this._toggleExtraInfo = this._toggleExtraInfo.bind(this);
    this._hideElipsis = this._hideElipsis.bind(this);
  }

  /**
  *   @param {}
  *  reverse state of showExtraInfo
  */
  _toggleExtraInfo = () => {
    this.setState({ showExtraInfo: !this.state.showExtraInfo });
  }
  /**
    @param {string} timestamp
    if input is undefined. current time of day is used
    inputs a time stamp and return the time of day HH:MM am/pm
    @return {string}
  */
  _getTimeOfDay(timestamp) {
    const time = (timestamp !== undefined) ? new Date(timestamp) : new Date();
    const hour = (time.getHours() % 12 === 0) ? 12 : time.getHours() % 12;
    const minutes = (time.getMinutes() > 9) ? time.getMinutes() : `0${time.getMinutes()}`;
    const ampm = time.getHours() >= 12 ? 'pm' : 'am';
    return `${hour}:${minutes}${ampm}`;
  }
  /**
    @param {string} freeText
    use SimpleMDE to get html of markdown
    @return {html}
  */
  _catagorizeDetails(node) {
    const categories = {
      detailObjects: {},
      detailKeys: {},
    };

    node.detailObjects.forEach((detail) => {
      if (categories.detailObjects[detail.type] === undefined) {
        categories.detailObjects[detail.type] = [detail];
        categories.detailKeys[detail.type] = [detail.key];
      } else {
        categories.detailObjects[detail.type].push(detail);
        categories.detailKeys[detail.type].push(detail.key);
      }
    });

    return categories;
  }


  _hideElipsis() {
    this.setState({ showEllispsis: false });
  }
  render() {
    const categorizedDetails = this._catagorizeDetails(this.props.node);
    return (
      <div className="ActivityDetail">
        {
          Object.keys(categorizedDetails.detailObjects).map((key, index) => (
            <ActivityDetailList
              hideElipsis={this._hideElipsis}
              edge={this.props.edge}
              categorizedDetails={categorizedDetails}
              itemKey={key}
              key={key + index}
              siblingCount={this.props.node.detailObjects.length}
              show={this.props.show}
              showEllispsis={this.state.showEllispsis}
            />
            ))
        }
      </div>
    );
  }
}

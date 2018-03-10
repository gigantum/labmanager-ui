//vendor
import React, { Component } from 'react'

/**
*  labbook panel is to only render the edge passed to it
*/

export default class LocalLabbookPanel extends Component {

  constructor(props) {
    super(props);

    this.state = {
      'exportPath': '',
    }
  }

  _getContainerStatusText(containerStatus, imageStatus){

    let status = (containerStatus === 'RUNNING') ? 'Open' : containerStatus;
    status = (containerStatus === 'NOT_RUNNING') ? 'Closed' : status;
    status = (imageStatus === "BUILD_IN_PROGRESS") ? 'Building' : status;

    return status;
  }


  render(){
    let edge = this.props.edge;
    let status = this._getContainerStatusText(edge.node.environment.containerStatus, edge.node.environment.imageStatus)

    return (
      <div
        onClick={() => this.props.goToLabbook(edge.node.name, edge.node.owner)}
        key={edge.node.name}
        className='LocalLabbooks__panel flex flex--column justify--space-between'>

        <div className="LocalLabbooks__icon-row">

          <div className="LocalLabbooks__containerStatus">
            <div className={'LocalLabbooks__containerStatus--state ' + status}>
              {status}
            </div>
          </div>
        </div>

        <div className="LocalLabbooks__text-row">
          <div className="LocalLabbooks__title-row">
            <h6
              className="LocalLabbooks__panel-title"
              onClick={() => this.props.goToLabbook(edge.node.name, edge.node.owner)}>
              {edge.node.name}
            </h6>

          </div>
          <p className="LocalLabbooks__owner">{'Created by ' + edge.node.owner}</p>
          <p
            className="LocalLabbooks__description">
            {edge.node.description}
          </p>
        </div>
    </div>)
  }
}

import React, { Component } from 'react'

/**
*  labbook panel is to only render the edge passed to it
*/

export default class LocalLabbookPanel extends Component {
  _getContainerStatusText(containerStatus, imageStatus){

    let status = (containerStatus === 'RUNNING') ? 'Open' : containerStatus;
    status = (containerStatus === 'NOT_RUNNING') ? 'Closed' : status;
    status = (imageStatus === "BUILD_IN_PROGRESS") ? 'Building' : status;

    return status;
  }
  render(){
    let edge = this.props.edge;
    console.log(edge)
    let status = 'Closed';//this._getContainerStatusText(edge.node.environment.containerStatus, edge.node.environment.imageStatus)

    console.log(status)
    return (
      <div
        key={edge.node.name}
        onClick={() => this.props.goToLabbook(edge.node.name)}
        className='LocalLabbooks__panel flex flex--column justify--space-between'>

        <div className="LocalLabbooks__icon-row">
          <div className="LocalLabbooks__labbook-icon"></div>
          <div className="ContainerStatus flex flex--column">
            <div className={'ContainerStatus__container-state ' + status}>
              {status}
            </div>
          </div>
        </div>

        <div className="LocalLabbooks__text-row">
          <h4>{edge.node.name}</h4>
          <p className="LocalLabbooks__description">
            {edge.node.description}
          </p>
        </div>

        <div className="LocalLabbooks__info-row flex flex--row">
          <div className="LocalLabbooks__owner flex flex--row">
              <div>Owner</div>
              <div className="LocalLabbooks__owner-icon"></div>
              {/* <div> {owner.username}</div> */}
          </div>
          <div className="LocalLabbooks__status">

          </div>

        </div>


    </div>)
  }
}

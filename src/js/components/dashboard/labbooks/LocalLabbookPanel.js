import React, { Component } from 'react'

export default class LocalLabbookPanel extends Component {

  render(){
    let edge = this.props.edge
    return (<div
      key={edge.node.name}
      onClick={() => this.props.goToLabbook(edge.node.name)}
      className='LocalLabbooks__panel flex flex--column justify--space-between'>
        <div className="LocalLabbooks__icon-row">
          <div className="LocalLabbooks__labbook-icon"></div>
        </div>
        <div className="LocalLabbooks__text-row">
          <h4>{edge.node.name}</h4>
          <p className="LocalLabbooks__description">{edge.node.description}</p>
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

import React from 'react'

export default class SuccessMessage extends React.Component {
  _openLabbook(){
    let labbookName = this.props.labbookName;
    this.props.history.push(`../labbooks/${labbookName}`)
  }
  render(){

    return(
      <div className="SuccessMessage flex flex--column justify--space-around">
          <p className="SuccessMessage__message">Success!</p>
          <p className="SuccessMessage__message">You have create a new Lab Book. You can always edit and update your Lab Book on its detail page.</p>
          <button onClick={()=> this._openLabbook()}>Open Lab Book</button>
      </div>
      )
  }
}

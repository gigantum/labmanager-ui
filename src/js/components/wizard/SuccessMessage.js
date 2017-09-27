import React from 'react'

export default class SuccessMessage extends React.Component {
  constructor(props){
    super(props)
    this.continueSave = this.continueSave.bind(this);
  }
  /*
    function()
    gets labbook name from props and sends user to labbook view
  */
  continueSave(){
    let labbookName = this.props.labbookName;
    document.getElementById('modal__cover').classList.add('hidden')
    this.props.history.push(`../labbooks/${labbookName}`)
  }
  render(){

    return(
      <div className="SuccessMessage flex flex--column justify--space-around">
          <p className="SuccessMessage__message">Success!</p>
          <p className="SuccessMessage__message">You have create a new Lab Book. You can always edit and update your Lab Book on its detail page.</p>
          {/* <button className="SuccessMessage__button" onClick={()=> this._openLabbook()}>Open Lab Book</button> */}
      </div>
      )
  }
}

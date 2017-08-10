import React from 'react'

export default class SuccessMessage extends React.Component {

  render(){

    return(
      <div className="SuccessMessage flex flex--column justify--space-around">
          <p className="SuccessMessage__message">Success!</p>
          <p className="SuccessMessage__message">You have create a new Lab Book. You can always edit and update your Lab Book on its detail page.</p>
      </div>
      )
  }
}

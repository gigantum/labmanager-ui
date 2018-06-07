import React, { Component } from 'react'

export default class Home extends Component {
  constructor(props){
    super(props)
    let username = localStorage.getItem('username')
    let email = localStorage.getItem('email')
    let firstName = localStorage.getItem('given_name')
    let lastName = localStorage.getItem('family_name')
    this.state = {
      username,
      email,
      firstName,
      lastName
    }
  }

  /**
   * @param {event, string}
   * updates user text state and stores for updating
   *
   */
  _updateTextState(evt, type){
    this.setState({
      [type]: evt.target.value
    })
  }
  /**
   * @param {event, string}
   * uses state and updates user settings via the api
   *
   */
  _saveUserUpdates(){

  }

  render() {
    return(
      <div className="Profile">
        <h3>Profile</h3>

        <p>
          Update your profile information here.
        </p>

        <div className="Profile__indent">
          <div className="Profile__input-row">
            <label>Username</label>
            <input
              disabled
              type="text"
              placeholder={this.state.username}
            />
          </div>

          <div className="Profile__input-row">
            <label>Email</label>
            <input
              onKeyUp={(evt)=> this._updateTextState(evt, 'email')}
              onChange={(evt)=> this._updateTextState(evt, 'email')}
              type="text"
              placeholder={this.state.email}
            />
          </div>
          <div className="Profile__input-row">
            <label>First Name</label>
            <input
              onKeyUp={(evt)=> this._updateTextState(evt, 'firstName')}
              onChange={(evt)=> this._updateTextState(evt, 'firstName')}
              type="text"
              placeholder={this.state.firstName}
            />
          </div>
          <div className="Profile__input-row">
            <label>Last Name</label>
            <input
              onKeyUp={(evt)=> this._updateTextState(evt, 'lastName')}
              onChange={(evt)=> this._updateTextState(evt, 'lastName')}
              type="text"
              placeholder={this.state.lastName}
            />
          </div>

          <div className="Profile__save">
            <button onClick={() => this._saveUserUpdates()}>Save</button>
          </div>
        </div>

      </div>
    )
  }
}

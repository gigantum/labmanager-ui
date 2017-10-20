import React, { Component } from 'react'
import {Link} from 'react-router-dom'

export default class User extends Component {

  constructor(props){
    super(props)

    this.state = {
      familyName: localStorage.getItem('family_name') || '',
      username: localStorage.getItem('username') || '',
      givenName: localStorage.getItem('given_name') || '',
      email: localStorage.getItem('email') || '',
      dropdownVisible: false
    }

    this._toggleDropdown = this._toggleDropdown.bind(this)
    this.handleClickOutside = this._handleClickOutside.bind(this);
  }

    componentDidMount() {
     document.addEventListener('mousedown', this._handleClickOutside.bind(this));
   }

   componentWillUnmount() {
      document.removeEventListener('mousedown', this._handleClickOutside.bind(this));
   }

  /**
    @param {}
    logout through Auth0
  */
  logout() {
    this.props.auth.logout();
    this._toggleDropdown()
  }

  _handleClickOutside(event) {
    if(this.state.dropdownVisible){
      this.setState({
        dropdownVisible: false
      })
    }
   }



  /**
    @param {}
    toggles dropdown state
  */
  _toggleDropdown() {
    this.setState({
      dropdownVisible: !this.state.dropdownVisible
    })
  }


  render() {
    const { isAuthenticated } = this.props.auth;
    return (
      <div className="User">

        <h6 onClick={() => { this._toggleDropdown()}} className={this.state.dropdownVisible ? 'User__name--active' :  'User__name'}>{this.state.givenName + ' ' + this.state.familyName}</h6>
        <div className={ this.state.dropdownVisible ? 'User__dropdown--arrow' : 'hidden'}></div>
        <div className={this.state.dropdownVisible ? 'User__dropdown' : 'hidden'}>
          <button
            className="User__button btn-margin"
            onClick={this.logout.bind(this)}
          >
            Log Out
        </button>

        </div>



      </div>
    )
  }
}

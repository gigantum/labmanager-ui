import React, { Component } from 'react'

export default class Header extends Component {

  goTo(route) {
    this.props.history.replace(`/login`)
  }

  logout() {
    this.props.auth.logout();
  }
  render() {
    const { isAuthenticated } = this.props.auth;
    return (
      <div className={'Header flex flex--row justify--space-between'}>
        <div className={'flex-1-0-auto'}>
          <h3 className='Header__title text-center'>
            Gigantum
          </h3>

          {
            isAuthenticated() && (
                <button
                  className="Header__button Header__button--logout btn-margin"
                  onClick={this.logout.bind(this)}
                >
                  Log Out
                </button>
              )
          }
        </div>
      </div>
    )
  }
}

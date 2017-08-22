import React, { Component } from 'react'
import {Link} from 'react-router-dom'

export default class Header extends Component {


  goTo(route) {
    this.props.history.replace(`/login`)
  }

  _setSelectedComponent(component){
    this.props.history.replace(`../${component}`)
  }

  logout() {
    this.props.auth.logout();
  }
  render() {
    const { isAuthenticated } = this.props.auth;
    return (
      <div className={'Header flex flex--row justify--space-between'}>
        <div className={'flex justify--space-around flex-1-0-auto'}>

          <ul className='Header__nav flex flex--row justify--space-between'>
            <li>
              <Link
                className="Header__nav-item Header__nav-item--datasets flex flex--row justify--space-between"
                to="../datasets"
              >
                <div className="Header__datasets-icon"></div>
                Datasets
              </Link>
            </li>
            <li>
              <Link

                className="Header__nav-item Header__nav-item--labbooks flex flex--row justify--space-between"
                to="../labbooks"
              >
                <div className="Header__labbook-icon"></div>
                Lab Books
              </Link>
            </li>

          </ul>

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

import React, { Component } from 'react'
import classNames from 'classnames'
import {Link} from 'react-router-dom'
//components
import User from './User'
import GigantumSVG from 'Images/logos/gigantum.svg'


export default class SideBar extends Component {
  /**
    @param {}
    logout through Auth0
  */
  logout() {
    this.props.auth.logout();
  }
  render() {
    const { isAuthenticated } = this.props.auth;
    const isLabbooks = (window.location.href.indexOf('labbooks') > 0) || (window.location.href.indexOf('datsets') === -1);
    let authed = isAuthenticated();
    let sidebarCSS = classNames({
      'SideBar col-sm-1': authed,
      'hidden': !authed
    })
    return (
      <div className={sidebarCSS}>
        <div className={'SideBar__inner-container'}>
          <img alt="gigantum" className="SideBar__logo" src={GigantumSVG}></img>
          <ul className='SideBar__nav'>
            <li className={isLabbooks ? 'SideBar__list-item--selected' : 'SideBar__list-item'}>
              <Link
                className={isLabbooks ? 'SideBar__nav-item SideBar__nav-item--labbooks SideBar__nav-item--selected' : 'SideBar__nav-item SideBar__nav-item--labbooks'}
                to={{pathname: '/labbooks'}}
              >
                <div className={isLabbooks ? 'SideBar__icon SideBar__icon--labbooks-selected' : 'SideBar__icon SideBar__icon--labbooks'}></div>
                LabBooks
              </Link>
            </li>
            <li className={!isLabbooks ? 'SideBar__list-item--selected' : 'SideBar__list-item'}>
              <div
                className={!isLabbooks ? 'SideBar__nav-item SideBar__nav-item--datasets SideBar__nav-item--selected' : 'SideBar__nav-item SideBar__nav-item--datasets'}
                to={{pathname: '/datasets'}}
                >
                <div className={!isLabbooks ? 'SideBar__icon SideBar__icon--datasets-selected' : 'SideBar__icon SideBar__icon--datasets'}></div>
                Datasets
               </div>
            </li>
          </ul>

          {
            authed && (
                <User {...this.props} />
              )
          }
        </div>
      </div>
    )
  }
}

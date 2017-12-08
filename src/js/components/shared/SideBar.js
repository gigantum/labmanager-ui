import React, { Component } from 'react'
import {Link} from 'react-router-dom'
//components
import User from './User'
import GigantumPNG from 'Images/logos/gigantum.png'


export default class SideBar extends Component {
  constructor(props){
  	super(props);
  }
  /**
    @param {}
    logout through Auth0
  */
  logout() {
    this.props.auth.logout();
  }
  render() {
    const { isAuthenticated } = this.props.auth;
    const isLabbooks = (window.location.href.indexOf('labbooks') > 0);
    return (
      <div className="SideBar col-sm-1">
        <div className={'SideBar__inner-container'}>
          <img className="SideBar__logo" src={GigantumPNG}></img>
          <ul className='SideBar__nav'>
            <li className={!isLabbooks ? 'SideBar__list-item--selected' : 'SideBar__list-item'}>
              <Link
                className={!isLabbooks ? 'SideBar__nav-item SideBar__nav-item--datasets SideBar__nav-item--selected' : 'SideBar__nav-item SideBar__nav-item--datasets'}
                to={{pathname: '/datasets'}}
              >
                <div className={!isLabbooks ? 'SideBar__icon SideBar__icon--datasets-selected' : 'SideBar__icon SideBar__icon--datasets'}></div>
                Datasets
              </Link>
            </li>
            <li className={isLabbooks ? 'SideBar__list-item--selected' : 'SideBar__list-item'}>
              <Link
                className={isLabbooks ? 'SideBar__nav-item SideBar__nav-item--labbooks SideBar__nav-item--selected' : 'SideBar__nav-item SideBar__nav-item--labbooks'}
                to={{pathname: '/labbooks'}}
              >
                <div className={isLabbooks ? 'SideBar__icon SideBar__icon--labbooks-selected' : 'SideBar__icon SideBar__icon--labbooks'}></div>
                Lab Books
              </Link>
            </li>

          </ul>

          {
            isAuthenticated() && (
                <User {...this.props} />
              )
          }
        </div>
      </div>
    )
  }
}

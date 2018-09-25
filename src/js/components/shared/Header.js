import React, { Component } from 'react';
import { Link } from 'react-router-dom';
// components
import User from './User';


export default class Header extends Component {
  /**
    @param {}
    logout through Auth0
  */
  logout() {
    this.props.auth.logout();
  }
  render() {
    const { isAuthenticated } = this.props.auth;
    return (
      <div className="Header flex flex--row justify--space-between">
        <div className="flex justify--space-around flex-1-0-auto">

          <ul className="Header__nav flex flex--row justify--space-between">
            <li>
              <Link
                className="Header__nav-item Header__nav-item--datasets flex flex--row justify--space-between"
                to={{ pathname: '/datasets' }}
              >
                <div className="Header__datasets-icon" />
                Datasets
              </Link>
            </li>
            <li>
              <Link
                className="Header__nav-item Header__nav-item--labbooks flex flex--row justify--space-between"
                to={{ pathname: '/projects' }}
              >
                <div className="Header__labbook-icon" />
                Projects
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
    );
  }
}

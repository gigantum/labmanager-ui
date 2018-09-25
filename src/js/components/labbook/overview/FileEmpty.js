import React, { Component } from 'react';
import { Link } from 'react-router-dom';
// store
import store from 'JS/redux/store';
// assets
import './FileEmpty.scss';

export default class FileEmpty extends Component {
  render() {
    const { owner, labbookName } = store.getState().routes;
    const mainText = this.props.mainText;
    const subText = this.props.subText;
    return (
      <div className="FileEmpty">
        <div className={`FileEmpty__container FileEmpty__container--${this.props.section}`}>

          <p className="FileEmpty__text FileEmpty__text--main">{mainText}</p>
          {!this.props.callback ?
            <Link
              className="FileEmpty__text FileEmpty__text--sub"
              to={{ pathname: `../../../../projects/${owner}/${labbookName}/${this.props.section}` }}
              replace
            >
              {subText}
            </Link>
                    :
            <p
              className="FileEmpty__sub-text"
              onClick={() => { this.props.callback(); }}
            >
              {subText}
            </p>
                    }
        </div>
      </div>
    );
  }
}

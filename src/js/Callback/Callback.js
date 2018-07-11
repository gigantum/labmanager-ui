import React, { Component } from 'react';
import history from 'JS/history'
import Loader from 'Components/shared/Loader';

export default class Callback extends Component {
  // componentWillMount() {
  //     history.replace('projects/local')
  // }
  render() {

    return(
      <div className="Callback">
        <div className="Callback__loader">
          <Loader />
        </div>
      </div>)
  }
}

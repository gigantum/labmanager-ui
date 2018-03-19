import React, { Component } from 'react';
import Loader from 'Components/shared/Loader';

export default class Callback extends Component {
  render() {
    return(
      <div className="Callback">
        <div className="Callback__loader">
          <Loader />
        </div>
      </div>)
  }
}


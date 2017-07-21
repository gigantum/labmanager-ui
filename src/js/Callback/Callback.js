import React, { Component } from 'react';
//import loading from './loading.svg';

class Callback extends Component {
  render() {
    this.props.history.replace(`/home`)
    const style = {
      position: 'absolute',
      display: 'flex',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'white',
    }

    return (
      <div style={style}>
        <img src="" alt="loading"/>
      </div>
    );
  }
}

export default Callback;

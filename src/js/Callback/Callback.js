import React, { Component } from 'react';
import Routes from 'Components/Routes'
import store from 'JS/redux/store'

class Callback extends Component {
  render() {
    let route = sessionStorage.getItem('CALLBACK_ROUTE') ? sessionStorage.getItem('CALLBACK_ROUTE') : '/labbooks';

    this.props.history.replace(route)

    return(<Routes />)
  }
}

export default Callback;

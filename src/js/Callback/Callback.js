import React, { Component } from 'react';
import Routes from 'Components/Routes'
import store from 'JS/redux/store'

class Callback extends Component {
  componentWillMount() {
    let route = sessionStorage.getItem('CALLBACK_ROUTE') ? sessionStorage.getItem('CALLBACK_ROUTE') : '/labbooks';
    console.log(this)
    this.props.history.replace(route)
  }
  render() {
    return(<div></div>)
  }
}

export default Callback;

//vendor
import React, { Component } from 'react'
//assets
import logoCirlce from 'Images/logos/logo-circle-cyan.png'


export default class Loader extends Component {

  render() {
    return (
      <div className="Loader">
        <img alt="logo-circle" src={logoCirlce} className="Loader__logo" />
        <div className="Loader__logo-border" />
      </div>
    )
  }
}

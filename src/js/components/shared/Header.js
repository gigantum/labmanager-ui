import React, { Component } from 'react'
import GigantumLogo from '../../../images/logos/gigantum.png';

export default class Header extends Component {
  render() {
    return (
      <div className={'header__container flex flex--row justify--space-between'}>
        <div className={'flex-1-0-auto'}>
          <h1 className='header__title text-center'>Gigantum</h1>
        </div>
        <div>
          <img alt='gigantum logo' src={GigantumLogo} height='60'/>
        </div>
      </div>
    )
  }
}

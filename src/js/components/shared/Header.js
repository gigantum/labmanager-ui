import React, { Component } from 'react'

export default class Header extends Component {
  render() {
    return (
      <div className={'header__container flex flex--row justify--space-between'}>
        <div className={'flex-1-0-auto'}>
          <h3 className='header__title text-center'>
            Gigantum
          </h3>
        </div>
      </div>
    )
  }
}

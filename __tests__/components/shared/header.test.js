import React, { Component } from 'react'
import {MemoryRouter } from 'react-router-dom'
import {mount} from 'enzyme'
import renderer from 'react-test-renderer';
import Header from 'Components/shared/Header';
import Auth from 'JS/Auth/Auth';
import history from 'JS/history';

const auth = new Auth();
auth.isAuthenticated = function(){return false};

test('Test Header rendering', () => {
  const component = renderer.create(
    <MemoryRouter history={history}>
      <Header auth={auth} history={history}/>
    </MemoryRouter>
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});


describe('test header links', () => {
  const component = mount(
    <MemoryRouter history={history}>
      <Header auth={auth} history={history}/>
    </MemoryRouter>
  );

  it('test dataset click', () =>{
    component.find('.Header__nav-item--datasets').simulate('click')
    //console.log(component)
  })

  it('test labbokk click', () =>{
    component.find('.Header__nav-item--labbooks').simulate('click')
  })
});

describe('Test Header rendering', () => {

  auth.isAuthenticated = function(){return true};
  const component = mount(
    <MemoryRouter history={history}>
      <Header auth={auth} history={history}/>
    </MemoryRouter>
  );

  it('test logout click', () =>{
    component.find('.Header__button--logout').simulate('click')
  })

});

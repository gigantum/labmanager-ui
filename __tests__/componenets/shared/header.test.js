import React, { Component } from 'react'
import {MemoryRouter } from 'react-router-dom'
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

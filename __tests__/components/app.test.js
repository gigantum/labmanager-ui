import React from 'react';
import App from 'Components/App';
import {mount} from 'enzyme'
import renderer from 'react-test-renderer';
import Auth from 'JS/Auth/Auth';

test('Test if isAuthenticated == true', () => {

  //const isAuthenticated = function(){return true};
  let auth = new Auth();
  auth.isAuthenticated = function(){return true};
  const component = renderer.create(
    <App auth={auth} />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});

describe('Test if isAuthenticated true button click', () => {

  //const isAuthenticated = function(){return true};
  let auth = new Auth();
  auth.isAuthenticated = function(){return true};
  const component = mount(
    <App auth={auth} />
  );
  component.find('.btn-margin').simulate('click')

});

describe('Test if isAuthenticated false button click', () => {

  //const isAuthenticated = function(){return true};
  let auth = new Auth();
  auth.isAuthenticated = function(){return false};
  auth.login = function(){return true};
  const component = mount(
    <App auth={auth} />
  );

  component.find('.btn-margin').simulate('click')


});

test('Test if isAuthenticated == false', () => {
  const auth = new Auth();
  auth.isAuthenticated = function(){return false};
  const component = renderer.create(
    <App auth={auth}/>
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});

test('Test login', () => {
  const auth = new Auth();
  let login = auth.login();

  console.log(login)

});

import React from 'react';
import App from './../src/js/components/App';
import renderer from 'react-test-renderer';
import Auth from './../src/js/Auth/Auth';

test('Test if isAuthenticated == true', () => {

  //const isAuthenticated = function(){return true};
  const auth = new Auth();
  auth.isAuthenticated = function(){return true};
  const component = renderer.create(
    <App auth={auth} />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

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

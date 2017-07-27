import React from 'react';
import App from '../js/components/App';
import renderer from 'react-test-renderer';
import Auth from './../js/Auth/Auth';

test('Test if isAuthenticated == true', () => {

  const isAuthenticated =  function(){return true};
  const auth = new Auth();
  const component = renderer.create(
    <App auth={auth} />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

  // manually trigger the callback
  //tree.props.onMouseEnter();
  // re-rendering
  // tree = component.toJSON();
  // expect(tree).toMatchSnapshot();
  //
  // // manually trigger the callback
  // //tree.props.onMouseLeave();
  // // re-rendering
  // tree = component.toJSON();
  // expect(tree).toMatchSnapshot();
});

test('Test if isAuthenticated == false', () => {

  const isAuthenticated = function(){return false};
  const component = renderer.create(
    <App isAuthenticated={isAuthenticated}/>
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

  // manually trigger the callback
  //tree.props.onMouseEnter();
  // re-rendering
  // tree = component.toJSON();
  // expect(tree).toMatchSnapshot();
  //
  // // manually trigger the callback
  // //tree.props.onMouseLeave();
  // // re-rendering
  // tree = component.toJSON();
  // expect(tree).toMatchSnapshot();
});

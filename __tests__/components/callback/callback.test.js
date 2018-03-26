import React from 'react';
import Callback from 'JS/callback/Callback';
import {shallow, mount} from 'enzyme'
import renderer from 'react-test-renderer';
import history from 'JS/history'

test('Test Overview rendering', () => {
  //const isAuthenticated = function(){return true};
  const component = renderer.create(
      <Callback history={history} />
  );

  let tree = component.toJSON();
  expect(component).toMatchSnapshot();

});

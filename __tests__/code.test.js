import React from 'react';
import Code from './../src/js/components/labbook/Code';
import renderer from 'react-test-renderer';

test('Test Code rendering', () => {

  //const isAuthenticated = function(){return true};
  const component = renderer.create(
    <Code />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});

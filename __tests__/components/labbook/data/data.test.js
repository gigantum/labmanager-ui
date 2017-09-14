import React from 'react';
import Data from 'Components/labbook/data/Data';
import renderer from 'react-test-renderer';

test('Test Code rendering', () => {

  //const isAuthenticated = function(){return true};
  const component = renderer.create(
    <Data />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});

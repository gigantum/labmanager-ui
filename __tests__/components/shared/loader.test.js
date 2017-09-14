import React, { Component } from 'react'
import renderer from 'react-test-renderer';
import Loader from 'Components/shared/Loader';

test('Test Loader rendering', () => {
  const component = renderer.create(

    <Loader/>
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});

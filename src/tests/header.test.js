import React, { Component } from 'react'
import renderer from 'react-test-renderer';
import GigantumLogo from '../images/logos/gigantum.png';
import Header from './../js/components/shared/Header';

test('Header Reners Correctly', () => {
  const component = renderer.create(
    <Header />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});

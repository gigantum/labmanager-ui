import React, { Component } from 'react'
import renderer from 'react-test-renderer';
import GigantumLogo from './../src/images/logos/gigantum.png';
import Header from './../src/js/components/shared/Header';

test('Test Header rendering', () => {
  const component = renderer.create(
    <Header />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});

import React, { Component } from 'react'
import renderer from 'react-test-renderer';
import Footer from 'Components/shared/footer/Footer';


test('Test Footer rendering', () => {
  const component = renderer.create(
      <Footer />

  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});

import React from 'react'
import renderer from 'react-test-renderer';
import DatasetsLabbooksContainer from './../js/components/datasetsLabbooks/DatasetsLabbooksContainer';

test('DatasetsLabbooksContainer Renders Correctly', () => {
  const component = renderer.create(
    <DatasetsLabbooksContainer />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
  // manually trigger the callback
  tree.children[0].children[0].props.onClick()
  //re-rendering
  tree = component.toJSON();
  expect(tree).toMatchSnapshot();

  // manually trigger the callback
  tree.children[0].children[1].props.onClick()
  // re-rendering
  tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});

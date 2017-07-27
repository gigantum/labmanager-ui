import React from 'react'
import renderer from 'react-test-renderer';
import {StaticRouter, Link} from 'react-router';
import DatasetsLabbooksContainer from './../js/components/datasetsLabbooks/DatasetsLabbooksContainer';

test('DatasetsLabbooksContainer Renders Correctly', () => {
  const context = {}
  const component = renderer.create(
    <StaticRouter location="home/datasets" context={context}>
      <DatasetsLabbooksContainer match={{params: {id: 'datasets'}}} />
    </StaticRouter>
  );
  let tree = component.toJSON();

  expect(tree).toMatchSnapshot();
  console.log(tree.children[0].children[0].children[0].props)
  // manually trigger the callback
  tree.children[0].children[0].children[0].props.onClick()
  //re-rendering
  tree = component.toJSON();
  expect(tree).toMatchSnapshot();

  // manually trigger the callback
  tree.children[0].children[1].children[0].props.onClick()
  // re-rendering
  tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});

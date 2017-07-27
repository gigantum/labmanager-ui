import React from 'react'
import renderer from 'react-test-renderer';
import {StaticRouter, Link} from 'react-router';
import DatasetsLabbooksContainer from './../js/components/datasetsLabbooks/DatasetsLabbooksContainer';

test('Test DatasetsLabbooksContainer rendering and state changes', () => {
  const context = {}
  const component = renderer.create(
    <StaticRouter location="home/datasets" context={context}>
      <DatasetsLabbooksContainer match={{params: {id: 'datasets'}}} />
    </StaticRouter>
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();//initail snapshot
  console.log(component)
  //overwrite default onCLick to prevent preventedDefault bug
  tree.children[0].children[0].children[0].props.onClick = jest.genMockFunction();
  //add click for datasets
  tree.children[0].children[0].children[0].props.onClick()
  //re-rendering
  tree = component.toJSON();

  expect(tree).toMatchSnapshot();

  //overwrite default onCLick to prevent preventedDefault bug
  tree.children[0].children[0].children[1].props.onClick = jest.genMockFunction();
  //add click for labooks
  tree.children[0].children[0].children[1].props.onClick()
  //take labbbok state snapshot
  tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});

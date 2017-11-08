import React from 'react';
import OutputData from 'Components/labbook/outputData/OutputData';
import renderer from 'react-test-renderer';

const variables = {first:20, labbook: 'demo-lab-book'}
export default variables

test('Test Code rendering', () => {

  //const isAuthenticated = function(){return true};
  const component = renderer.create(
    <OutputData />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});

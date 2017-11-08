import React from 'react';
import InputData from 'Components/labbook/inputData/InputData';
import renderer from 'react-test-renderer';

const variables = {first:20, labbook: 'demo-lab-book'}
export default variables

test('Test Code rendering', () => {

  //const isAuthenticated = function(){return true};
  const component = renderer.create(
    <InputData />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});

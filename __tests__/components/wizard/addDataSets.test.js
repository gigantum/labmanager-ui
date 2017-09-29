import React from 'react';
import AddDataSets from 'Components/wizard/AddDataSets';
import {mount} from 'enzyme'
import renderer from 'react-test-renderer';
import Auth from 'JS/Auth/Auth';

const variables = {first:20, labbook: 'demo-lab-book'}
export default variables

let toggleDisabledContinue = () => {}
let setComponent = () => {}

test('Test AddDataSets rendering', () => {

  const component = renderer.create(
    <AddDataSets
      toggleDisabledContinue={toggleDisabledContinue}
      setComponent={setComponent}
      nextWindow={'addDatasets'}
      labbookName={'demo-lab-book'}/>
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});

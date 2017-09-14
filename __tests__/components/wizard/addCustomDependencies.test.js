import React from 'react';
import AddCustomDependencies from 'Components/wizard/AddCustomDependencies';
import {mount} from 'enzyme'
import renderer from 'react-test-renderer';
import Auth from 'JS/Auth/Auth';

let toggleDisabledContinue = () => {}
let setComponent = () => {}

test('Test AddCustomDependencies rendering', () => {

  const component = renderer.create(
    <AddCustomDependencies

      toggleDisabledContinue={toggleDisabledContinue}
      setComponent={setComponent}
      nextWindow={'addDatasets'}
      labbookName={'demo-lab-book'}/>
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});

describe('Test AddCustomDependencies rendering', () => {

  const component = mount(
    <AddCustomDependencies

      toggleDisabledContinue={toggleDisabledContinue}
      setComponent={setComponent}
      nextWindow={'addDatasets'}
      labbookName={'demo-lab-book'}/>
  );

});

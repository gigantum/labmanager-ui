import React from 'react';
import AddCustomDependencies from 'Components/wizard/AddCustomDependencies';
import {mount} from 'enzyme'
import renderer from 'react-test-renderer';
import Auth from 'JS/Auth/Auth';
import config from './config'
import relayTestingUtils from 'relay-testing-utils'

let toggleDisabledContinue = () => {}
let setComponent = () => {}

test('Test AddCustomDependencies rendering', async () => {

  const component = await renderer.create(
    relayTestingUtils.relayWrap(
      <AddCustomDependencies
        availableCustomDependencies={config.data.availableCustomDependencies}
        toggleDisabledContinue={toggleDisabledContinue}
        setComponent={setComponent}
        nextWindow={'addDatasets'}
        labbookName={'demo-lab-book'}/>
      )
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});

describe('Test AddCustomDependencies rendering', () => {

  const component = mount(
    relayTestingUtils.relayWrap(<AddCustomDependencies

      toggleDisabledContinue={toggleDisabledContinue}
      setComponent={setComponent}
      nextWindow={'addDatasets'}
      labbookName={'demo-lab-book'}/>)
  );


});

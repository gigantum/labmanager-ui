import React from 'react';
import AddCustomDependencies from 'Components/wizard/AddCustomDependencies';
import {mount} from 'enzyme'
import renderer from 'react-test-renderer';
import Auth from 'JS/Auth/Auth';
import sinon from 'sinon'
import relayTestingUtils from 'relay-testing-utils'
import json from './__relaydata__/AddCustomDependencies.json'


let variables = {first: 5}

export default variables

let toggleDisabledContinue = () => {}
let setComponent = () => {}

test('Test AddCustomDependencies rendering', async () => {
  console.log(relayTestingUtils.relayWrap)
  const component = await renderer.create(
    relayTestingUtils.relayWrap(
      <AddCustomDependencies
        data={json.data}
        availableCustomDependencies={json.data.availableCustomDependencies}
        toggleDisabledContinue={toggleDisabledContinue}
        setComponent={setComponent}
        nextWindow={'addDatasets'}
        labbookName={'demo-lab-book'}/>, {}, json.data
      )
  );


  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});

//
// describe('Test AddCustomDependencies rendering', () => {
//
//   const component = mount(
//     relayTestingUtils.relayWrap(<AddCustomDependencies
//
//       toggleDisabledContinue={toggleDisabledContinue}
//       setComponent={setComponent}
//       nextWindow={'addDatasets'}
//       labbookName={'demo-lab-book'}/>)
//   );
//   console.log(component)
//
// });

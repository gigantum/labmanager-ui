import React from 'react';
import SelectDevelopmentEnvironment from 'Components/wizard/SelectDevelopmentEnvironment';
import {mount} from 'enzyme'
import renderer from 'react-test-renderer';
import Auth from 'JS/Auth/Auth';
import json from './__relaydata__/SelectDevelopmentEnvironment.json'
import relayTestingUtils from 'relay-testing-utils'

const variables = {first:20, labbook: 'demo-lab-book'}
export default variables

let toggleDisabledContinue = () => {}
let setComponent = () => {}
let setLabbookName = () => {}


test('Test SelectDevelopmentEnvironment rendering', () => {
  console.log(json.data)
  const component = renderer.create(


      relayTestingUtils.relayWrap(<SelectDevelopmentEnvironment
        toggleDisabledContinue={toggleDisabledContinue}
        labbookName={'demo-lab-book'}
        setComponent={setComponent}
        setLabbookName={setLabbookName}
        nextWindow={'addEnvironmentPackage'}/>, {}. json.data)

  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});

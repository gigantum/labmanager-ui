import React from 'react';
import SelectBaseImage from 'Components/wizard/SelectBaseImage';
import {mount} from 'enzyme'
import renderer from 'react-test-renderer';
import Auth from 'JS/Auth/Auth';
import json from './__relaydata__/SelectBaseImage.json'


const variables = {first:20, labbook: 'demo-lab-book'}
export default variables

let toggleDisabledContinue = () => {}
let setComponent = () => {}
let setLabbookName = () => {}
let setBaseImage = () => {}


test('Test SelectBaseImage rendering', () => {

  const component = renderer.create(


      <SelectBaseImage
        toggleDisabledContinue={toggleDisabledContinue}
        labbookName={'demo-lab-book'}
        setComponent={setComponent}
        setLabbookName={setLabbookName}
        setBaseImage={setBaseImage}
        nextWindow={'selectDevelopmentEnvironment'}
      />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});

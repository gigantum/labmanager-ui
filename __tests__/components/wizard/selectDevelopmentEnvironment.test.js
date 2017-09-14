import React from 'react';
import SelectDevelopmentEnvironment from 'Components/wizard/SelectDevelopmentEnvironment';
import {mount} from 'enzyme'
import renderer from 'react-test-renderer';
import Auth from 'JS/Auth/Auth';

let toggleDisabledContinue = () => {}
let setComponent = () => {}
let setLabbookName = () => {}


test('Test SelectDevelopmentEnvironment rendering', () => {

  const component = renderer.create(


      <SelectDevelopmentEnvironment
        toggleDisabledContinue={toggleDisabledContinue}
        labbookName={'demo-lab-book'}
        setComponent={setComponent}
        setLabbookName={setLabbookName}
        nextWindow={'addEnvironmentPackage'}/>

  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});

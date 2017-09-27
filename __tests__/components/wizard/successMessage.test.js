import React from 'react';
import SuccessMessage from 'Components/wizard/SuccessMessage';
import {mount} from 'enzyme'
import history from 'JS/history'
import renderer from 'react-test-renderer';
import Auth from 'JS/Auth/Auth';

let toggleDisabledContinue = () => {}

test('Test SuccessMessage rendering', () => {

  const component = renderer.create(


      <SuccessMessage
        history={history}
        toggleDisabledContinue={toggleDisabledContinue}
        labbookName={'demo-lab-book'}
        nextWindow={'addEnvironmentPackage'}/>

  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});

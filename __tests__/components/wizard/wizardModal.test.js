import React from 'react';
import WizardModal from 'Components/wizard/WizardModal';
import {mount} from 'enzyme'
import history from 'JS/history'
import renderer from 'react-test-renderer';
import Auth from 'JS/Auth/Auth';

let handler = () => {}

test('Test WizardModal rendering', () => {

  const component = renderer.create(
      <WizardModal
        history={history}
        handler={handler}
      />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});

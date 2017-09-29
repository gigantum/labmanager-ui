import React from 'react';
import CreateLabbook from 'Components/wizard/CreateLabbook';
import {mount} from 'enzyme'
import renderer from 'react-test-renderer';
import Auth from 'JS/Auth/Auth';

const variables = {first:20, labbook: 'demo-lab-book'}
export default variables

let toggleDisabledContinue = () => {}
let setComponent = () => {}
let setLabbookName = () => {}

let baseImage = {}

test('Test CreateLabbook rendering', () => {

  const component = renderer.create(
      <CreateLabbook
      toggleDisabledContinue={toggleDisabledContinue}
      setComponent={setComponent}
      setLabbookName={setLabbookName}
      nextWindow={'selectBaseImage'}/>
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});

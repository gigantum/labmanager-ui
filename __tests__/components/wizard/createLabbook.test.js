import React from 'react';
import CreateLabbook from 'Components/wizard/CreateLabbook';
import {mount} from 'enzyme'
import renderer from 'react-test-renderer';
import Auth from 'JS/Auth/Auth';

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

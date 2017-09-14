import React from 'react';
import ImportCode from 'Components/wizard/ImportCode';
import {mount} from 'enzyme'
import renderer from 'react-test-renderer';
import Auth from 'JS/Auth/Auth';

let toggleDisabledContinue = () => {}
let setComponent = () => {}
let setLabbookName = () => {}

test('Test ImportCode rendering', () => {

  const component = renderer.create(


      <ImportCode
        toggleDisabledContinue={toggleDisabledContinue}
        labbookName={'demo-lab-book'}
        setComponent={setComponent}
        setLabbookName={setLabbookName}
        nextWindow={'successMessage'}/>
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});

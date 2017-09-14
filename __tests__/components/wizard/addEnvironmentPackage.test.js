import React from 'react';
import AddEnvironmentPackage from 'Components/wizard/AddEnvironmentPackage';
import {mount} from 'enzyme'
import renderer from 'react-test-renderer';
import Auth from 'JS/Auth/Auth';

let toggleDisabledContinue = () => {}
let setComponent = () => {}

let baseImage = {}

test('Test AddEnvironmentPackage rendering', () => {

  const component = renderer.create(

      <AddEnvironmentPackage
        baseImage={baseImage}
        toggleDisabledContinue={toggleDisabledContinue} availablePackageManagers={['apt-get', 'pip']}  labbookName={'demo-lab-book'}
        setComponent={setComponent}
        nextWindow={'addCustomDependencies'}/>
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});

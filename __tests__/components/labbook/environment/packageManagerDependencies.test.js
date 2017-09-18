import React from 'react';
import PackageManagerDependencies from 'Components/labbook/environment/PackageManagerDependencies';
import renderer from 'react-test-renderer';
import config from './../config'

let _setComponent = () => ({});
let _setBaseImage = () => ({});
let _buildCallback = () => ({});

test('Test PakageManager rendering', () => {

  //const isAuthenticated = function(){return true};
  const component = renderer.create(
    <PackageManagerDependencies
      environment={config.data.labbook.environment}
      blockClass={"Environment"}
      labbookName={config.data.labbook.name}
      environmentId={config.data.labbook.environment.id}
      setBaseImage={_setBaseImage}
      setComponent={_setComponent}
      buildCallback={_buildCallback}
      baseImage={config.data.labbook.environment.baseImage}
    />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});

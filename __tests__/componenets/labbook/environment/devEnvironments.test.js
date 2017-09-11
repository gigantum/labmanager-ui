import React from 'react';
import DevEnvironments from 'Components/labbook/environment/DevEnvironments';
import renderer from 'react-test-renderer';
import config from './../config'
let _buildCallback = () => ({})

test('Test DevEnvironments rendering', () => {

  //const isAuthenticated = function(){return true};
  const component = renderer.create(
    <DevEnvironments
      environment={config.data.labbook.environment}
      blockClass={"Environment"}
      labbookName={config.data.labbook.name}
      environmentId={config.data.labbook.environment.id}
      editVisible={true}
      buildCallback={_buildCallback}

    />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});

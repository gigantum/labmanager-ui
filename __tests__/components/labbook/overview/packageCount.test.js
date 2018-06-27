import React from 'react';
import PackageCount from 'Components/labbook/overview/PackageCount';
import {shallow, mount} from 'enzyme'
import renderer from 'react-test-renderer';
import config from './../config'
import {MemoryRouter } from 'react-router-dom'

const variables = {first:20, name: 'ui-test-labbook', owner: 'default'}
export default variables

let _setBuildingState = ((state) => {

})

test('Test PackageCount rendering', async () => {
  //const isAuthenticated = function(){return true};
  const component = await renderer.create(

      <PackageCount labbookName={config.data.labbook.name} />

  );
  let tree = component.toJSON();
  expect(component).toMatchSnapshot();

});

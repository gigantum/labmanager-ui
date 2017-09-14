import React from 'react';
import PackageCount from 'Components/labbook/overview/PackageCount';
import {shallow, mount} from 'enzyme'
import renderer from 'react-test-renderer';
import config from './../config'
import {MemoryRouter } from 'react-router-dom'
let _setBuildingState = ((state) => {
  console.log(state)
})


test('Test PackageCount rendering', () => {
  //const isAuthenticated = function(){return true};
  const component = renderer.create(

      <PackageCount labbookName={config.data.labbook.name} />

  );
  let tree = component.toJSON();
  expect(component).toMatchSnapshot();

});

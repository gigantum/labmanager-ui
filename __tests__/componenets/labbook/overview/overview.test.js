import React from 'react';
import Overview from 'Components/labbook/overview/Overview';
import {shallow, mount} from 'enzyme'
import renderer from 'react-test-renderer';
import config from './../config'
import {MemoryRouter } from 'react-router-dom'
let _setBuildingState = ((state) => {
  console.log(state)
})

test('Test Overview rendering', () => {
  //const isAuthenticated = function(){return true};
  const component = mount(
    <MemoryRouter>
    <Overview labbook={config.data.labbook}
      key={config.data.labbook.name + '_overview'}
      description={config.data.labbook.description}
      labbookName={config.data.labbook.name}
      setBuildingState={_setBuildingState} />
    </MemoryRouter>
  );
  console.log(component)
  // let tree = component.toJSON();
  expect(component).toMatchSnapshot();

});

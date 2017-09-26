import React from 'react';
import Overview from 'Components/labbook/overview/Overview';
import {shallow, mount} from 'enzyme'
import renderer from 'react-test-renderer';
import config from './../config'
import {MemoryRouter } from 'react-router-dom'
let _setBuildingState = ((state) => {

})


test('Test Overview rendering', () => {
  //const isAuthenticated = function(){return true};
  const component = renderer.create(
    <MemoryRouter>
      <Overview
        labbook={config.data.labbook}
        key={config.data.labbook.name + '_overview'}
        description={config.data.labbook.description}
        labbookName={config.data.labbook.name}
        setBuildingState={_setBuildingState} />
      </MemoryRouter>
  );

  let tree = component.toJSON();
  expect(component).toMatchSnapshot();

});

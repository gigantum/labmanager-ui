import React from 'react';
import Overview from 'Components/labbook/overview/Overview';
import {shallow, mount} from 'enzyme'
import renderer from 'react-test-renderer';
import {MemoryRouter } from 'react-router-dom'
import config from './../config'
import relayTestingUtils from 'relay-testing-utils'

const variables = {first:20, labbook: 'demo-lab-book'}
export default variables

let _setBuildingState = ((state) => {

})


test('Test Overview rendering', () => {
  //const isAuthenticated = function(){return true};
  const component = renderer.create(

      relayTestingUtils.relayWrap(<Overview
        labbook={config.data.labbook}
        key={config.data.labbook.name + '_overview'}
        description={config.data.labbook.description}
        labbookName={config.data.labbook.name}
        setBuildingState={_setBuildingState} />, {}, config.data.labbook.environment)
  );

  let tree = component.toJSON();
  expect(component).toMatchSnapshot();

});

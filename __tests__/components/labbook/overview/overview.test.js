import React from 'react';
import Overview from 'Components/labbook/overview/Overview';
import {shallow, mount} from 'enzyme'
import renderer from 'react-test-renderer';
import {MemoryRouter } from 'react-router-dom'
import json from './../../__relaydata__/Routes.json'
import relayTestingUtils from 'relay-testing-utils'

const variables = {first:20, labbook: 'demo-lab-book'}
export default variables

let _setBuildingState = ((state) => {

})

const fixtures = {
  labbook: json.data.labbook,
  description: json.data.labbook.description,
  labbookId: json.data.labbook.id,
  setBuildingState: ()=>{},
  readme: json.data.labbook.readme
}
test('Test Overview rendering', () => {
  //const isAuthenticated = function(){return true};
  const component = renderer.create(

      relayTestingUtils.relayWrap(  <MemoryRouter><Overview
        {...fixtures} /></MemoryRouter>, {}, json.data.labbook.environment)

  );

  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});

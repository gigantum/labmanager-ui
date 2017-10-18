import React from 'react';
import DevEnvironments from 'Components/labbook/environment/DevEnvironments';
import renderer from 'react-test-renderer';
import json from './../../__relaydata__/Routes.json'
import {mount} from 'Enzyme'
import relayTestingUtils from 'relay-testing-utils'
let _buildCallback = () => ({})
let devEnvironments = {}
let _setComponent = (comp) => {
   devEnvironments.comp = comp;
};

const variables = {first:20, name: 'demo-lab-book', cursor: 'MA==', owner: 'default'}
export default variables

test('Test DevEnvironments rendering', () => {

  //const isAuthenticated = function(){return true};
  const component = renderer.create(
    relayTestingUtils.relayWrap(<DevEnvironments
      environment={json.data.labbook.environment}
      blockClass={"Environment"}
      labbookName={json.data.labbook.name}
      environmentId={json.data.labbook.environment.id}
      editVisible={true}
      buildCallback={_buildCallback}
    />, {}, json.data.labbook.environment.devEnvs)
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});



describe("Test Modal Visible", () =>{
  let newDiv = document.createElement("div");
  newDiv.id = 'modal__cover'


  const wrapper = mount(
    relayTestingUtils.relayWrap(<DevEnvironments
      environment={json.data.labbook.environment}
      blockClass={"Environment"}
      labbookName={json.data.labbook.name}
      environmentId={json.data.labbook.environment.id}
      editVisible={true}
      buildCallback={_buildCallback}
    />, {}, json.data.labbook.environment.devEnvs)
  );


  it('test modal open' , () =>{
    let button = wrapper.find('.Environment__edit-button')
    button.simulate('click')
    expect(wrapper.node.state.modal_visible).toBeTruthy()
  })

  it('test modal closed' , () =>{
    let button = wrapper.find('.Environment__modal-close')
    button.simulate('click')
    expect(!wrapper.node.state.modal_visible).toBeTruthy()
  })



})

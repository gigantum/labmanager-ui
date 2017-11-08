import React from 'react';
import CustomDependencies from 'Components/labbook/environment/CustomDependencies';
import renderer from 'react-test-renderer';
import json from './../../__relaydata__/Routes.json'
import {mount} from 'enzyme'
import relayTestingUtils from 'relay-testing-utils'

//import data from './__relaydata__/CustomDependencies.json'


const variables = {first:20, name: 'demo-lab-book', cursor: 'MA==', owner: 'default'}
export default variables

let _setBaseImage = () => ({});
let _buildCallback = () => ({});


let customDeps = {};
let _setComponent = (comp) => {
   customDeps.comp = comp;
   return comp
};

test('Test CustomDependencies rendering', () => {

  //const isAuthenticated = function(){return true};
  const component = renderer.create(
    relayTestingUtils.relayWrap(<CustomDependencies
      environment={json.data.labbook.environment}
      blockClass={"Environment"}
      labbookName={json.data.labbook.name}
      environmentId={json.data.labbook.environment.id}
      setBaseImage={_setBaseImage}
      setComponent={_setComponent}
      editVisible={false}
      buildCallback={_buildCallback}
      baseImage={json.data.labbook.environment.baseImage}
    />, {}, json.data.labbook.environment)
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});

test('Test CustomDependencies rendering', () => {

  //const isAuthenticated = function(){return true};
  const component = renderer.create(
    relayTestingUtils.relayWrap(<CustomDependencies
      environment={json.data.labbook.environment}
      blockClass={"Environment"}
      labbookName={json.data.labbook.name}
      environmentId={json.data.labbook.environment.id}
      setBaseImage={_setBaseImage}
      setComponent={_setComponent}
      editVisible={false}
      buildCallback={_buildCallback}
      baseImage={json.data.labbook.environment.baseImage}
    />, {}, json.data.labbook.environment)
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});

describe("Test Edit Visible", () =>{

  const customDependenciesObj = new CustomDependencies();
  const component = renderer.create(
    relayTestingUtils.relayWrap(<CustomDependencies
      environment={json.data.labbook.environment}
      blockClass={"Environment"}
      labbookName={json.data.labbook.name}
      environmentId={json.data.labbook.environment.id}
      setBaseImage={_setBaseImage}
      setComponent={_setComponent}
      editVisible={false}
      buildCallback={_buildCallback}
      baseImage={json.data.labbook.environment.baseImage}
    />, {}, json.data.labbook.environment)
  );
  const cd = customDependenciesObj._setComponent('customDependencies')


  expect('customDependencies' === 'customDependencies').toBeTruthy()
})


describe("Test Modal Visible", () =>{
  let newDiv = document.createElement("div");
  newDiv.id = 'modal__cover'


  const wrapper = mount(
    relayTestingUtils.relayWrap(<CustomDependencies
      environment={json.data.labbook.environment}
      blockClass={"Environment"}
      labbookName={json.data.labbook.name}
      environmentId={json.data.labbook.environment.id}
      setBaseImage={_setBaseImage}
      setComponent={_setComponent}
      editVisible={false}
      buildCallback={_buildCallback}
      baseImage={json.data.labbook.environment.baseImage}
    />, {}, json.data.labbook.environment)
  );


  it('test modal open' , () =>{
    console.log(wrapper)
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

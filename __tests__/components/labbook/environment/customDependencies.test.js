import React from 'react';
import CustomDependencies from 'Components/labbook/environment/CustomDependencies';
import renderer from 'react-test-renderer';
import config from './../config'
import {mount} from 'enzyme'


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
    <CustomDependencies
      environment={config.data.labbook.environment}
      blockClass={"Environment"}
      labbookName={config.data.labbook.name}
      environmentId={config.data.labbook.environment.id}
      setBaseImage={_setBaseImage}
      setComponent={_setComponent}
      editVisible={false}
      buildCallback={_buildCallback}
      baseImage={config.data.labbook.environment.baseImage}
    />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});

test('Test CustomDependencies rendering', () => {

  //const isAuthenticated = function(){return true};
  const component = renderer.create(
    <CustomDependencies
      environment={config.data.labbook.environment}
      blockClass={"Environment"}
      labbookName={config.data.labbook.name}
      environmentId={config.data.labbook.environment.id}
      setBaseImage={_setBaseImage}
      editVisible={true}
      setComponent={_setComponent}
      buildCallback={_buildCallback}
      baseImage={config.data.labbook.environment.baseImage}
    />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});

describe("Test Edit Visible", () =>{

  const customDependenciesObj = new CustomDependencies();
  const component = renderer.create(
    <CustomDependencies
      environment={config.data.labbook.environment}
      blockClass={"Environment"}
      labbookName={config.data.labbook.name}
      environmentId={config.data.labbook.environment.id}
      setBaseImage={_setBaseImage}
      editVisible={true}
      setComponent={_setComponent}
      buildCallback={_buildCallback}
      baseImage={config.data.labbook.environment.baseImage}
    />
  );
  const cd = customDependenciesObj._setComponent('customDependencies')


  expect('customDependencies' === 'customDependencies').toBeTruthy()
})


describe("Test Modal Visible", () =>{
  let newDiv = document.createElement("div");
  newDiv.id = 'modal__cover'


  const wrapper = mount(
    <CustomDependencies
      environment={config.data.labbook.environment}
      blockClass={"Environment"}
      labbookName={config.data.labbook.name}
      environmentId={config.data.labbook.environment.id}
      setBaseImage={_setBaseImage}
      editVisible={true}
      setComponent={_setComponent}
      buildCallback={_buildCallback}
      baseImage={config.data.labbook.environment.baseImage}
    />
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

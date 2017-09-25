import React from 'react';
import DevEnvironments from 'Components/labbook/environment/DevEnvironments';
import renderer from 'react-test-renderer';
import config from './../config'
import {mount} from 'Enzyme'

let _buildCallback = () => ({})
let devEnvironments = {}
let _setComponent = (comp) => {
   devEnvironments.comp = comp;
};

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


// describe("Test Edit Visible", () =>{
//
//   const devEnvironmentsObj = new DevEnvironments();
//   devEnvironmentsObj.props = {
//     editVisible: true
//   }
//
//   expect(devEnvironmentsObj._editVisible()).toBeTruthy()
// })

// describe("Test Edit Visible", () =>{
//
//   const devEnvironmentsObj = new DevEnvironments();
//   let comp = devEnvironmentsObj._setComponent('devEnvironments')
//   console.log(comp)
//   expect('baseImage' === 'baseImage').toBeTruthy()
// })



describe("Test Modal Visible", () =>{
  let newDiv = document.createElement("div");
  newDiv.id = 'modal__cover'


  const wrapper = mount(
      <DevEnvironments
        environment={config.data.labbook.environment}
        blockClass={"Environment"}
        labbookName={config.data.labbook.name}
        environmentId={config.data.labbook.environment.id}
        editVisible={true}
        buildCallback={_buildCallback}
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

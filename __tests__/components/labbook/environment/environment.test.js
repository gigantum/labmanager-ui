import React from 'react';
import {mount} from 'enzyme';
import Environment from 'Components/labbook/environment/Environment';
import renderer from 'react-test-renderer';
import {MemoryRouter } from 'react-router-dom'
import config from './../config'
let environ;
let _setBuildingState = ((state) => {
})
test('Test Environment rendering', () => {
  let props = {labbookName: config.data.labbook.name}

  const component = renderer.create(
    <MemoryRouter>
      <Environment
        labbook={config.data.labbook}
        key={config.data.labbook.name + '_environment'}
        labbookId={config.data.labbook.id}
        setBuildingState={_setBuildingState}
        labbookName={config.data.labbook.name}
      />
    </MemoryRouter>
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});


describe("Test Modal Visible", () =>{

  const wrapper = mount(

      <Environment
        labbook={config.data.labbook}
        key={config.data.labbook.name + '_environment'}
        labbookId={config.data.labbook.id}
        setBuildingState={_setBuildingState}
        labbookName={config.data.labbook.name}
      />

  );

    it('test base Image oepn modal' , () =>{
      wrapper.find('#baseImageEdit').simulate('click')

      expect(wrapper.node.refs.baseImage.state.modal_visible).toBeTruthy()
    })

    it('test base Image modal closed' , () =>{
      wrapper.find('#baseImageEditClose').simulate('click')

      expect(!wrapper.node.refs.baseImage.state.modal_visible).toBeTruthy()
    })

    it('test devEnvironments modal open' , () =>{

      wrapper.find('#devEnvironmentsEdit').simulate('click')
      expect(wrapper.node.refs.devEnvironments.state.modal_visible).toBeTruthy()
    })

    it('test devEnvironments modal closed' , () =>{

      wrapper.find('#devEnvironmentsEditClose').simulate('click')
      expect(!wrapper.node.refs.devEnvironments.state.modal_visible).toBeTruthy()
    })

    it('test packageManagerDependencies modal open' , () =>{

      wrapper.find('#packageManagerEdit').simulate('click')
      expect(wrapper.node.refs.packageManagerDependencies.state.modal_visible).toBeTruthy()
    })

    it('test packageManagerDependencies modal closed' , () =>{

      wrapper.find('#packageManagerEditClose').simulate('click')
      expect(!wrapper.node.refs.packageManagerDependencies.state.modal_visible).toBeTruthy()
    })


    it('test CustomDependencies modal open' , () =>{

      wrapper.find('#customDependenciesEdit').simulate('click')
      expect(wrapper.node.refs.CustomDependencies.state.modal_visible).toBeTruthy()
    })


    it('test CustomDependencies modal closed' , () =>{

      wrapper.find('#customDependenciesEditClose').simulate('click')
      expect(!wrapper.node.refs.CustomDependencies.state.modal_visible).toBeTruthy()
    })
})


// describe("Test Modal Visible", () =>{
//
//   let environment = new Environment()
//
//   it('test setting base image' , async () =>{
//     let callback = await environment._buildCallback()
//     // //expect().toBeTruthy()
//   })
// })

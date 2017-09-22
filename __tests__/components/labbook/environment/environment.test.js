import React from 'react';
import {mount} from 'enzyme';
import Environment from 'Components/labbook/environment/Environment';
import renderer from 'react-test-renderer';
import {MemoryRouter } from 'react-router-dom'
import config from './../config'
let environ;
let _setBuildingState = ((state) => {
  //console.log(state)
})
test('Test Environment rendering', () => {
  let props = {labbookName: config.data.labbook.name}
  //const isAuthenticated = function(){return true};
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
  let newDiv = document.createElement("div");
  newDiv.id = 'modal__cover'


  const wrapper = mount(

      <Environment
        labbook={config.data.labbook}
        key={config.data.labbook.name + '_environment'}
        labbookId={config.data.labbook.id}
        setBuildingState={_setBuildingState}
        labbookName={config.data.labbook.name}
      />

  );


    it('test modal closed' , () =>{
      wrapper.setState({message: 'error', show: true})
      expect(wrapper.node).toMatchSnapshot()
    })

    it('test modal closed' , () =>{
      wrapper.find('Environment__edit-button').at(0).simulate('click')
      expect(wrapper.node).toMatchSnapshot()
    })


    it('test modal closed' , () =>{
      wrapper.find('Environment__edit-button').at(1).simulate('click')
      expect(wrapper.node).toMatchSnapshot()
    })

})

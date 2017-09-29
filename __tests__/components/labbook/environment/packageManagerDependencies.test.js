import React from 'react';
import PackageManagerDependencies from 'Components/labbook/environment/PackageManagerDependencies';
import renderer from 'react-test-renderer';
import config from './../config'
import {mount} from 'enzyme'

const variables = {first:20, name: 'demo-lab-book',  cursor: 'MA==', owner: 'default'}
export default variables

let _setComponent = () => ({});
let _setBaseImage = () => ({});
let _buildCallback = () => ({});

test('Test PakageManager rendering', () => {

  //const isAuthenticated = function(){return true};
  const component = renderer.create(
    <PackageManagerDependencies
      environment={config.data.labbook.environment}
      blockClass={"Environment"}
      labbookName={config.data.labbook.name}
      environmentId={config.data.labbook.environment.id}
      setBaseImage={_setBaseImage}
      setComponent={_setComponent}
      buildCallback={_buildCallback}
      baseImage={config.data.labbook.environment.baseImage}
    />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});






describe("Test Modal Visible", () =>{
  let newDiv = document.createElement("div");
  newDiv.id = 'modal__cover'


  const wrapper = mount(
    <PackageManagerDependencies
      environment={config.data.labbook.environment}
      blockClass={"Environment"}
      labbookName={config.data.labbook.name}
      environmentId={config.data.labbook.environment.id}
      setBaseImage={_setBaseImage}
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

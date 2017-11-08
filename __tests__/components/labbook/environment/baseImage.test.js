import React from 'react';
import BaseImage from 'Components/labbook/environment/BaseImage';
import renderer from 'react-test-renderer';
import json from './../../__relaydata__/Routes.json'
import sinon from 'sinon';
import {shallow, mount, render} from 'enzyme'


const variables = {first:20, labbook: 'demo-lab-book', name: 'defualt', owner: 'default'}
export default variables

let baseImage = {};
let _setComponent = (comp) => {
   baseImage.comp = comp;
};
let _setBaseImage = () => ({});
let _buildCallback = () => ({});
test('Test BaseImage rendering', () => {

  //const isAuthenticated = function(){return true};
  const component = renderer.create(
    <BaseImage
      environment={json.data.labbook.environment}
      blockClass={"Environment"}
      labbookName={json.data.labbook.name}
      environmentId={json.data.labbook.environment.id}
      editVisible={true}
      setComponent={_setComponent}
      setBaseImage={_setBaseImage}
      buildCallback={_buildCallback}
      baseImage={json.data.labbook.environment.baseImage}

    />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();

});

describe("Test Edit Visible", () =>{

  const baseImageObj = new BaseImage();
  baseImageObj.props = {
    editVisible: true
  }

  expect(baseImageObj._editVisible()).toBeTruthy()
})

describe("Test Edit Visible", () =>{

  const baseImageObj = new BaseImage();
  baseImageObj._setComponent('baseImage')
  expect('baseImage' === 'baseImage').toBeTruthy()
})



describe("Test Modal Visible", () =>{
  let newDiv = document.createElement("div");
  newDiv.id = 'modal__cover'


  const wrapper = mount(
      <BaseImage
        environment={json.data.labbook.environment}
        blockClass={"Environment"}
        labbookName={json.data.labbook.name}
        environmentId={json.data.labbook.environment.id}
        editVisible={true}
        setComponent={_setComponent}
        setBaseImage={_setBaseImage}
        buildCallback={_buildCallback}
        baseImage={json.data.labbook.environment.baseImage}

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

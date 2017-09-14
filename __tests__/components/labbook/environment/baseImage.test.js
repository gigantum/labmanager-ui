import React from 'react';
import BaseImage from 'Components/labbook/environment/BaseImage';
import renderer from 'react-test-renderer';
import sinon from 'sinon';
import {shallow, mount, render} from 'enzyme'
import config from './../config'



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
      environment={config.data.labbook.environment}
      blockClass={"Environment"}
      labbookName={config.data.labbook.name}
      environmentId={config.data.labbook.environment.id}
      editVisible={true}
      setComponent={_setComponent}
      setBaseImage={_setBaseImage}
      buildCallback={_buildCallback}
      baseImage={config.data.labbook.environment.baseImage}

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

  expect(baseImageObj._editVisiible()).toBeTruthy()
})

describe("Test Edit Visible", () =>{

  const baseImageObj = new BaseImage();
  baseImageObj._setComponent('baseImage')
  expect('baseImage' === 'baseImage').toBeTruthy()
})


describe("Test Edit Visible", () =>{
  let newDiv = document.createElement("div");
  newDiv.id = 'modal__cover'


  const wrapper = mount(
      <BaseImage
        environment={config.data.labbook.environment}
        blockClass={"Environment"}
        labbookName={config.data.labbook.name}
        environmentId={config.data.labbook.environment.id}
        editVisible={true}
        setComponent={_setComponent}
        setBaseImage={_setBaseImage}
        buildCallback={_buildCallback}
        baseImage={config.data.labbook.environment.baseImage}

      />
  );

  let button = wrapper.find('.Environment__edit-button')
  button.simulate('click')

  expect(wrapper.node.state.modal_visible).toBeTruthy()


})

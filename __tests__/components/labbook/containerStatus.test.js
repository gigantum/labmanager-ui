import ContainerStatus from 'Components/labbook/ContainerStatus';
import React from 'react';
import config from './config'
import renderer from 'react-test-renderer';
import { mount, shallow } from 'enzyme';

import {MemoryRouter } from 'react-router-dom'


let _setBuildingState = () =>{

}

test('Test Container Rendering Building', async () => {
      const component = await renderer.create(
        <ContainerStatus
          containerStatus={"Building"}
          labbookName={"demo-lab-book"}
          setBuildingState={_setBuildingState}
          isBuilding={true}
        />
      )
      let tree = component.toJSON();
      expect(tree).toMatchSnapshot();
})

test('Test Container Rendering Open', async () => {
      const component = await renderer.create(
        <ContainerStatus
          containerStatus={"Open"}
          labbookName={"demo-lab-book"}
          setBuildingState={_setBuildingState}
          isBuilding={false}
        />
      )
      let tree = component.toJSON();

      expect(tree).toMatchSnapshot();
})

test('Test Container Rendering Closed', async () => {
      const component = await renderer.create(
        <ContainerStatus
          containerStatus={"Closed"}
          labbookName={"demo-lab-book"}
          setBuildingState={_setBuildingState}
          isBuilding={false}
        />
      )
      let tree = component.toJSON();
      expect(tree).toMatchSnapshot();
})

describe('Test Container Rendering Closed', async () => {
      const component = await mount(
        <ContainerStatus
          containerStatus={"Closed"}
          labbookName={"demo-lab-book"}
          setBuildingState={_setBuildingState}
          isBuilding={false}
        />
      )
      
})

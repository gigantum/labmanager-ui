import ContainerStatus from 'Components/labbook/containerStatus/ContainerStatus';
import React from 'react';
import config from './config'
import json from './__relaydata__/ContainerStatus.json'
import renderer from 'react-test-renderer';
import { mount, shallow } from 'enzyme';
import relayTestingUtils from 'relay-testing-utils'
import {MemoryRouter } from 'react-router-dom'

let variables = {name: 'demo-lab-book', owner: 'default', first: '20'}

export default variables

let _setBuildingState = () =>{
}

test('Test Container Rendering Building', async () => {
      const component = await renderer.create(
        relayTestingUtils.relayWrap(
           <ContainerStatus
              containerStatus={"Building"}
              labbookName={"demo-lab-book"}
              setBuildingState={_setBuildingState}
              isBuilding={true}
            />,{}, json.data)
      )

      let tree = component.toJSON();

      expect(tree).toMatchSnapshot();
})

test('Test Container Rendering Open', async () => {
      const component = await renderer.create(
        relayTestingUtils.relayWrap(<ContainerStatus
          containerStatus={"Building"}
          labbookName={"demo-lab-book"}
          setBuildingState={_setBuildingState}
          isBuilding={true}
        />,{}, json.data)
      )
      let tree = component.toJSON();

      expect(tree).toMatchSnapshot();
})

test('Test Container Rendering Closed', async () => {
      const component = await renderer.create(
        relayTestingUtils.relayWrap(<ContainerStatus
          containerStatus={"Closed"}
          labbookName={"demo-lab-book"}
          setBuildingState={_setBuildingState}
          isBuilding={true}
        />,{}, json.data)
      )
      let tree = component.toJSON();
      expect(tree).toMatchSnapshot();
})

describe('Test Container Rendering Closed', async () => {
      const component = mount(
        relayTestingUtils.relayWrap(<ContainerStatus
          containerStatus={"Closed"}
          labbookName={"demo-lab-book"}
          setBuildingState={_setBuildingState}
          isBuilding={false}
        />,{}, json.data)
      )

      await expect(component.instance().updater.enqueueForceUpdate()).toEventuallyBeFulfilled();

})

describe('Test Container Status Click on Closed', async () => {
      const component = mount(
        relayTestingUtils.relayWrap(<ContainerStatus
          containerStatus={"Closed"}
          labbookName={"demo-lab-book"}
          setBuildingState={_setBuildingState}
          isBuilding={false}
        />,{}, json.data)
      )


      component.find('.ContainerStatus').simulate('click')
      expect(component.node.state.status === 'Starting').toBeTruthy()

})

describe('Test Container Status Click on Open', async () => {
      const component = mount(
        relayTestingUtils.relayWrap(<ContainerStatus
          containerStatus={"Closed"}
          labbookName={"demo-lab-book"}
          setBuildingState={_setBuildingState}
          isBuilding={false}
        />,{}, json.data)
      )


      component.find('.ContainerStatus').simulate('click')
      expect(component.node.state.status === 'Stopping').toBeTruthy()

})

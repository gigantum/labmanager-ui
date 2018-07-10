import React from 'react';
import PackageCount from 'Components/labbook/overview/PackageCount';
import {shallow, mount} from 'enzyme'
import renderer from 'react-test-renderer';
import config from './../config'
import {MemoryRouter } from 'react-router-dom'

let _setBuildingState = ((state) => {

})

describe('Test PackageCount rendering', () => {
  it('renders snapshot', async ()=>{
    const component = await renderer.create(

        <PackageCount labbookName={config.data.labbook.name} />

    );
    let tree = component.toJSON();
    expect(component).toMatchSnapshot();
  })


});

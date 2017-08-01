import Labbook from './../src/js/components/labbook/Labbook';
import React from 'react';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import relayTestingUtils from 'relay-testing-utils'


test('Test Labbook Rendering', () => {
      const component = renderer.create(

          <Labbook match={{params: {labbook_name: 'labook4'}}}/>
      );
      let tree = component.toJSON();
      expect(tree).toMatchSnapshot();
})

describe('Test nav item default state', () =>{

  let labbook = new Labbook()
  let navItem = labbook._getNavItem({id:'notes', name: 'Notes'});

  return (navItem.props.className === 'selected')
})

describe('Test nav _getSelectedComponent default state', () =>{
  let labbook = new Labbook();
  labbook.props = {match:{params: {labbook_name: 'labook4'}}};

  let selectedComponent = labbook._getSelectedComponent();

  expect(selectedComponent.props.variables.name === 'labook4').toBeTruthy();

})
//TODO fix network error on test
describe('Test nav item default state', () =>{
  console.log(relayTestingUtils)
  const labbook = renderer.create(
    relayTestingUtils.relayWrap(<Labbook match={{params: {labbook_name: 'labook4'}}}/>)
  );
  //expect(tree).toMatchSnapshot();
})

import Labbook from './../js/components/labbook/Labbook';
import React from 'react';
import renderer from 'react-test-renderer';


test('Test Labbook Rendering', () => {
      const component = renderer.create(

          <Labbook match={{params: {labbook_name: 'labbook4'}}}/>
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
  //console.log(Labbook)
  //Labbook.props = {match:{params: {labbook_name: 'labbook4'}}};
  let labbook = new Labbook();
  labbook.props = {match:{params: {labbook_name: 'labbook4'}}};
  //console.log(labbook)
  let selectedComponent = labbook._getSelectedComponent();

  expect(selectedComponent.props.variables.name === 'labbook4').toBeTruthy();

})

// describe('Test nav item default state', () =>{
//
//   let labbook = new Labbook()
//   labbook._setSelectedComponent("environment")
//   console.log(labbook)
//   return (navItem.props.className === 'selected')
// })

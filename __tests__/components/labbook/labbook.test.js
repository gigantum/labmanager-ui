import Labbook from 'Components/labbook/Labbook';
import React from 'react';
import config from './config'
import renderer from 'react-test-renderer';
import {LabbookQuery} from 'Components/Routes'
import { mount, shallow } from 'enzyme';
import Auth from 'JS/Auth/Auth';
import history from 'JS/history'
import {MemoryRouter } from 'react-router-dom'
const auth = new Auth();


auth.isAuthenticated = function(){return true};

test('Test Labbook Rendering', () => {
      const component = renderer.create(
        <MemoryRouter history={MemoryRouter}>
          <Labbook
            key={'demo-lab-book'}
            auth={auth}
            history={history}
            labbookName={'demo-lab-book'}
            location={{pathname: '/demo-lab-book'}}
            labbook={config.data.labbook}
            match={{params: {labbook_name: 'demo-labbook-2'}}}/>
        </MemoryRouter>
      )
      let tree = component.toJSON();
      expect(tree).toMatchSnapshot();
})

describe('Test nav item default state', () =>{

  let labbook = mount(
    <MemoryRouter history={MemoryRouter}>
      <Labbook
        key={'demo-lab-book'}
        auth={auth}
        history={history}
        labbookName={'demo-lab-book'}
        location={{pathname: '/demo-lab-book'}}
        labbook={config.data.labbook}
        match={{params: {labbook_name: 'demo-labbook-2'}}}/>
      </MemoryRouter>
  )

  labbook.find('.Labbook__navigation-item--data').simulate('click')


  expect(labbook.find('.selected').text() === 'Data').toBeTruthy()
})

// describe('Test nav _getSelectedComponent default state', () =>{
//   let labbook = new Labbook({history:history, location: {pathname: '/demo-lab-book'}});
//
//   labbook.props = {match:{params: {labbook_name: 'labook4'}}};
//   let selectedComponent = labbook._getSelectedComponent();
//
//   expect(selectedComponent.props.variables.name === 'labook4').toBeTruthy();
//
// })
//TODO fix network error on test
// describe('Test nav item default state', () =>{
//   const labbook = mount(
//     relayTestingUtils.relayWrap(<Labbook match={{params: {labbook_name: 'labook4'}}}/>)
//   );
//   //expect(tree).toMatchSnapshot();
// })

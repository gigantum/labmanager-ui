import Labbook from 'Components/labbook/Labbook';
import React from 'react';
import renderer from 'react-test-renderer';
import {LabbookQuery} from 'Components/Routes'
import { mount, shallow } from 'enzyme';
import { QueryRenderer} from 'react-relay';
import relayTestingUtils from 'relay-testing-utils'
import Auth from 'JS/Auth/Auth';
import environment from 'JS/createRelayEnvironment';
const auth = new Auth();

const fixtures = {
  "labbook": {
     "id": "TGFiYm9vazpkZWZhdWx0JmRlbW8tbGFiLWJvb2s=",
     "description": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
     "environment": {
       "id": "RW52aXJvbm1lbnQ6ZGVmYXVsdCZkZWZhdWx0JmRlbW8tbGFiLWJvb2s="
     }
   }
 };

auth.isAuthenticated = function(){return true};

test('Test Labbook Rendering', () => {
      const component = shallow(
        <QueryRenderer
          environment={environment}
          query={LabbookQuery}
          variables={{name:'demo-lab-book', owner: 'default', first: 20}}
          render={({error, props}) => {
            return (<Labbook
            key={'demo-lab-book'}
            auth={auth}
            labbookName={'demo-lab-book'}

            labbook={fixtures.labbook}
            match={{params: {labbook_name: 'demo-labbook-2'}}}/>)
          }}
        />
      )
      // let tree = component.toJSON();
      // expect(tree).toMatchSnapshot();
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
// describe('Test nav item default state', () =>{
//   const labbook = mount(
//     relayTestingUtils.relayWrap(<Labbook match={{params: {labbook_name: 'labook4'}}}/>)
//   );
//   //expect(tree).toMatchSnapshot();
// })

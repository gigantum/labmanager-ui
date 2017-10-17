import Routes from 'Components/Routes';
import DatasetSets from 'Components/dashboard/datasets/DatasetSets';
import Labbook from 'Components/labbook/Labbook';
import Home from 'Components/home/Home';
import React from 'react';
import {StaticRouter, Link, Route, Switch, Router} from 'react-router';
import {mount, shallow} from 'Enzyme'
import Auth from 'JS/Auth/Auth';
import history from 'JS/history'
import renderer from 'react-test-renderer';
import relayTestingUtils from 'relay-testing-utils'
import config from './__relay__data/Routes.json'
// components
const context = {}

const variables = {first:20, owner: 'default', name: 'demo-lab-book'}
export default variables

test('Test Routes Rendering', () => {
      const auth = new Auth();
      auth.isAuthenticated = function(){return true};
      auth.login = function(){return true};
      auth.logout = function(){return true};

      const component = renderer.create(

          relayTestingUtils.relayWrap(<Routes />, {}, config)

      );
      let tree = component.toJSON();

      expect(tree).toMatchSnapshot();

});



describe('Test Routes View Change', () => {
      const auth = new Auth();
      auth.isAuthenticated = function(){return true};
      auth.login = function(){return true};
      auth.logout = function(){return true};

      const component = mount(

          <Routes />

      );

      component.find('.Header__nav-item').at(0).simulate('click')

});

// it('renders correct routes', () => {
//   const wrapper = mount(<Routes />);
//
//    let pathMap = wrapper.find(Route).reduce((pathMap, route) => {
//     if(route){
//       const routeProps = route.node.props;
//       pathMap[routeProps.path] = route.node.props.render;
//     }
//     return pathMap;
//   }, {});
//
//   const auth = new Auth();
//   const home = mount(<Home auth={auth}/>);
//
//   expect(pathMap['/:id']()).toBe(home);
// });

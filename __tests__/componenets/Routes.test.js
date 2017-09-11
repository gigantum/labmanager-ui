import Routes from 'Components/Routes';
import React from 'react';
import {StaticRouter, Link} from 'react-router';
import Auth from 'JS/Auth/Auth';
import renderer from 'react-test-renderer';
// components
const context = {}

//const routes = new Routes()
//console.log(routes)
//
test('Test Routes Rendering', () => {
      const auth = new Auth();
      auth.isAuthenticated = function(){return true};
      const component = renderer.create(

          <Routes auth={auth}/>

      );
      let tree = component.toJSON();



      expect(tree).toMatchSnapshot();

});

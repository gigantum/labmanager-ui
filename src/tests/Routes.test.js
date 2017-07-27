import Routes from './../js/components/Routes';
import React from 'react';
import {StaticRouter, Link} from 'react-router';
import Auth from './../js/Auth/Auth';
import renderer from 'react-test-renderer';
// components
const context = {}

test('Test routes component', () => {
      const auth = new Auth();
      auth.isAuthenticated = function(){return true};
      const component = renderer.create(

          <Routes auth={auth}/>

      );
      let tree = component.toJSON();



      expect(tree).toMatchSnapshot();

  });

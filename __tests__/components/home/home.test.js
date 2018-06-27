
import Home from 'Components/home/Home';
import React from 'react';
import renderer from 'react-test-renderer';
import Auth from 'JS/Auth/Auth';
import { Router } from "react-router";

const auth = new Auth();


auth.isAuthenticated = function(){return false};

auth.login = function(){return 'logged in'}


test('Test Home Rendering', () => {
      const component = renderer.create(

          <Home auth={auth}/>
      );
      let tree = component.toJSON();
      expect(tree).toMatchSnapshot();
})

test('Test Home Rendering', () => {
      let home = new Home({auth: auth})
      home.login();

      //expect(home.login() === 'logged in').toBeTruthy();
})


import Home from './../js/components/home/Home';
import React from 'react';
import renderer from 'react-test-renderer';
import Auth from './../js/Auth/Auth';
import { Router, createMemoryHistory } from "react-router";
const auth = new Auth();
const history = createMemoryHistory("/home");


test('Link changes the class when hovered', () => {
      const component = renderer.create(

          <Home auth={auth} history={history}/>

      );
      let tree = component.toJSON();
      expect(tree).toMatchSnapshot();
})

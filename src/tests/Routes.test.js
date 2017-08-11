import React, {Component} from 'react';
import { ServerRouter as Router, Route, Switch } from 'react-router-server';
import Callback from './../js/Callback/Callback';
import Auth from './../js/Auth/Auth';
import {createHistory } from './../js/history';
// components
import Home from './../js/components/home/Home';
import App from './../js/components/App';
import Header from './../js/components/shared/Header';

const history = createHistory();

import Routes from './../js/components/Routes';



    test('Link changes the class when hovered', () => {
      const component = renderer.create(
        <Routes />
      );
      let tree = component.toJSON();
      expect(tree).toMatchSnapshot();

      // manually trigger the callback
      //tree.props.onMouseEnter();
      // re-rendering
      // tree = component.toJSON();
      // expect(tree).toMatchSnapshot();
      //
      // // manually trigger the callback
      // //tree.props.onMouseLeave();
      // // re-rendering
      // tree = component.toJSON();
      // expect(tree).toMatchSnapshot();
    });

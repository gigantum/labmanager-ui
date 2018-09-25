// src/AppPrerenderer.js
import Routes from 'Components/Routes';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { JSDOM } from 'jsdom';
import fs from 'fs';
import fetch from 'node-fetch';
import FormData from 'form-data';

import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

// need to add root to JSDOM for mounting react
const window = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>').window;

// set variables for the api
window.location.hostname = 'localhost';
window.location.protocol = 'https:';

// set for proxy
process.env.GIGANTUM_API = process.env.USE_PROXY ? ':10010/labbook/' : ':10001/labbook/';

// add document globally
global.document = window.document;

// add window globally
global.window = window;

global.window.resizeTo = function (width, height) {
  global.window.innerWidth = width || global.window.innerWidth;
  global.window.innerHeight = width || global.window.innerHeight;
  global.window.dispatchEvent(new Event('resize'));
};

// add node fetch for environment
global.fetch = fetch;

// add formdata api for multipart forms
global.FormData = FormData;

// add file api for uploads
const File = window.File;
global.File = window.File;

global.window.matchMedia = window.matchMedia || function () { return { matches: false, addListener: () => {}, removeListener: () => {} }; };

global.requestAnimationFrame = function (callback) {
  setTimeout(callback, 0);
};

exports.prerender = function () {
  return ReactDOMServer.renderToString(<Routes />);
};

import {JSDOM} from 'jsdom';
import fs from 'fs'
import fetch from 'node-fetch'
import FormData from 'form-data'
import 'raf/polyfill';

import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

//need to add root to JSDOM for mounting react
const window = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>').window;

//set variables for the api
window.location.hostname = 'localhost'
window.location.protocol = 'https:'

//set for proxy
process.env.GIGANTUM_API =  process.env['USE_PROXY'] ? ':10010/labbook/' : ':10001/labbook/'

//add document globally
global.document = window.document;

//add window globally
global.window = window;

global.window.resizeTo = function(width, height){
  global.window.innerWidth = width || global.window.innerWidth;
  global.window.innerHeight = width || global.window.innerHeight;
  global.window.dispatchEvent(new Event('resize'));
};

//add node fetch for environment
global.fetch = fetch

//add formdata api for multipart forms
global.FormData = FormData

//add file api for uploads
global.File = window.File

global.window.matchMedia = window.matchMedia || function(){ return { matches: false, addListener: () => {}, removeListener: () => {}, }; }

global.requestAnimationFrame = function(callback){
  setTimeout(callback, 0);
};

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

import {JSDOM} from 'jsdom';
import fs from 'fs'
import fetch from 'node-fetch'
import FormData from 'form-data'

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

global.window.resizeTo = (width, height) => {
  global.window.innerWidth = width || global.window.innerWidth;
  global.window.innerHeight = width || global.window.innerHeight;
  global.window.dispatchEvent(new Event('resize'));
};

//add node fetch for environment
global.fetch = fetch

//add formdata api for multipart forms
global.FormData = FormData

//add file api for uploads
const File = window.File
global.File = window.File

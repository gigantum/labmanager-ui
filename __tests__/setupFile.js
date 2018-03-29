import {JSDOM} from 'jsdom';
import fs from 'fs'
import fetch from 'node-fetch-polyfill'
import FormData from 'form-data'


const window = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>').window;

window.location.hostname = 'localhost'
window.location.protocol = 'https:'
process.env.GIGANTUM_API = ':10001/labbook/'

global.document = window.document;

global.window = window;

global.window.resizeTo = (width, height) => {
  global.window.innerWidth = width || global.window.innerWidth;
  global.window.innerHeight = width || global.window.innerHeight;
  global.window.dispatchEvent(new Event('resize'));
};

global.fetch = fetch

//global.FormData = FormData
const File = window.File
global.File = window.File

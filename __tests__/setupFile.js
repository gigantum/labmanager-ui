import {JSDOM} from 'jsdom';

const window = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>').window;

global.document = window.document;

global.window = window;

global.window.resizeTo = (width, height) => {
  global.window.innerWidth = width || global.window.innerWidth;
  global.window.innerHeight = width || global.window.innerHeight;
  global.window.dispatchEvent(new Event('resize'));
};

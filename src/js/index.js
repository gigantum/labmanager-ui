import React from 'react';
import { render } from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import './../css/critical.scss';

// components
import Routes from './components/Routes';

render(
  <Routes />
  , document.getElementById('root')
);
registerServiceWorker();

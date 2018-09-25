import {
  createStore,
  compose,
  applyMiddleware,
} from 'redux';

import reducers from './combinedReducers';
import { persistPreferences } from '../utils/localStorage';

import { getPreferences } from './preferences/preferences';


const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const localStorageMiddleware = store => next => (action) => {
  const result = next(action);

  persistPreferences(getPreferences(store.getState()));

  return result;
};


export default createStore(
  reducers,
  composeEnhancers(applyMiddleware(localStorageMiddleware)),
);

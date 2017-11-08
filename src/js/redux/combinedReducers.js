import { combineReducers } from 'redux';
import footer from './reducers/footer';
import overview from './reducers/overview';

export default combineReducers({
  footer,
  overview
});

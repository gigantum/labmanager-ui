import { combineReducers } from 'redux';
import footer from './reducers/footer';
import overview from './reducers/overview';
import labbook from './reducers/labbook';
import detailView from './reducers/detail';
import routes from './reducers/routes';
import containerStatus from './reducers/containerStatus';

export default combineReducers({
  footer,
  overview,
  labbook,
  detailView,
  routes,
  containerStatus
});

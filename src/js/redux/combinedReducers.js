import { combineReducers } from 'redux';
import footer from './reducers/footer';
import routes from './reducers/routes';
//labbook reducers
import labbook from './reducers/labbook/labbook';
import detailView from './reducers/labbook/detail';
import containerStatus from './reducers/labbook/containerStatus';
//labbooks/overview reducers
import overview from './reducers/labbook/overview/overview';
//labbooks/overview reducers
import environment from './reducers/labbook/environment/environment';

export default combineReducers({
  footer,
  overview,
  labbook,
  detailView,
  routes,
  containerStatus,
  environment
});

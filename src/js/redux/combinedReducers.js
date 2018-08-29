import { combineReducers } from 'redux';
import footer from './reducers/footer';
import login from './reducers/login';
import routes from './reducers/routes';
import helper from './reducers/helper';
//labbook listing reducers
import labbookListing from './reducers/labbookListing/labbookListing'
//labbook reducers
import labbook from './reducers/labbook/labbook';
import detailView from './reducers/labbook/detail';
import containerStatus from './reducers/labbook/containerStatus';
//labbooks/overview reducers
import overview from './reducers/labbook/overview/overview';
//labbooks/environment reducers
import environment from './reducers/labbook/environment/environment';
import packageDependencies from './reducers/labbook/environment/packageDependencies';
//labbooks/fileBrowser reducers
import fileBrowser from './reducers/labbook/fileBrowser/fileBrowserWrapper';
//labbooks/branchMenu/collaborators reducers
import collaborators from './reducers/labbook/branchMenu/collaborators/collaborators';

export default combineReducers({
  footer,
  overview,
  labbook,
  detailView,
  routes,
  containerStatus,
  environment,
  packageDependencies,
  login,
  fileBrowser,
  collaborators,
  helper,
  labbookListing
});

import React from 'react'
import renderer from 'react-test-renderer';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {StaticRouter, Link} from 'react-router';
import {Provider} from 'react-redux'
import Dashboard from 'Components/dashboard/Dashboard';
import history from 'JS/history';
import {BrowserRouter as Router} from 'react-router-dom'
//store
import store from "JS/redux/store"

const variables = {first: 20}

test('Test Dashboard datasets', () => {

  const dashboard = renderer.create(
    <Provider store={store}>
      <Router>
        <Dashboard match={{params: {id: 'datasets'}}} history={history}/>
      </Router>
    </Provider>

  );
  let tree = dashboard.toJSON();
  expect(tree).toMatchSnapshot();
})


test('Test Dashboard Labbooks', () => {
  const dashboard = renderer.create(
    <Provider store={store}>
      <Router>
        <Dashboard match={{params: {id: 'labbbooks'}}} history={history}/>
      </Router>
    </Provider>
  );
  let tree = dashboard.toJSON();
  expect(tree).toMatchSnapshot();

});

// test('Test Dashboard Labbooks calls component did mount', () => {
//   sinon.spy(Dashboard.prototype, 'componentWillReceiveProps');
//   const dashboard = shallow(
//     <Dashboard match={{params: {id: 'labbbooks'}}} history={history}/>
//   );
//
//   expect(Dashboard.prototype.componentWillReceiveProps.calledOnce).toEqual(true);
//
// });
export default variables

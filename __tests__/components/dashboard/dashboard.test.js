import React from 'react'
import renderer from 'react-test-renderer';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {StaticRouter, Link} from 'react-router';
import {Provider} from 'react-redux'
import Dashboard from 'Components/dashboard/Dashboard';
import history from 'JS/history';
//store
import store from "JS/redux/store"

const variables = {first: 20}

test('Test Dashboard datasets', () => {

  const dashboard = renderer.create(
    <Provider store={store}>
      <Dashboard match={{params: {id: 'datasets'}}} history={history}/>
    </Provider>

  );
  let tree = dashboard.toJSON();
  expect(tree).toMatchSnapshot();
})


test('Test Dashboard Labbooks', () => {
  const dashboard = renderer.create(
    <Provider store={store}>
      <Dashboard match={{params: {id: 'labbbooks'}}} history={history}/>
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

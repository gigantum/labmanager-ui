import React from 'react'
import renderer from 'react-test-renderer';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {StaticRouter, Link} from 'react-router';
import Dashboard from 'Components/dashboard/Dashboard';
import history from 'JS/history';

const variables = {first: 20}

test('Test Dashboard datasets', () => {

  const dashboard = renderer.create(

    <Dashboard match={{params: {id: 'datasets'}}} history={history}/>

  );
  let tree = dashboard.toJSON();
  expect(tree).toMatchSnapshot();
})


test('Test Dashboard Labbooks', () => {
  const dashboard = renderer.create(

    <Dashboard match={{params: {id: 'labbboks'}}} history={history}/>

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

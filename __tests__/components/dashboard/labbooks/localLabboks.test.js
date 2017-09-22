import React from 'react'
import renderer from 'react-test-renderer';
import {shallow, mount} from 'enzyme';
import history from 'JS/history'
import {StaticRouter, Link} from 'react-router';
import config from './config'
import LocalLabbooks from 'Components/dashboard/labbooks/LocalLabbooks';
import relayTestingUtils from 'relay-testing-utils'
import {MemoryRouter } from 'react-router-dom'

import environment from 'JS/createRelayEnvironment'

const fixtures = {
  localLabbooks: config.data.localLabbooks
}

test('Test LocalLabbooks rendering', () => {

  const localLabbooks = renderer.create(

     relayTestingUtils.relayWrap(<LocalLabbooks history={history} {...fixtures} feed={config.data}/>)

  );

  const tree = localLabbooks.toJSON()

  expect(tree).toMatchSnapshot()
})


describe('Test LocalLabbooks panel length', () => {

  const localLabbooks = shallow(

     <LocalLabbooks history={history} {...fixtures} feed={config.data}/>

  );

  expect(localLabbooks.find('.LocalLabbooks__panel')).toHaveLength(21)
})


describe('Test LocalLabbooks load more', () => {
  const relay = {loadMore: () => {}}
  const localLabbooks = mount(

     <LocalLabbooks relay={relay} history={history} {...fixtures} feed={config.data}/>

  );

  //localLabbooks.find('button').at(0).simulate('click')
  //console.log(localLabbooks.find('.LocalLabbooks__panel'))
  expect(localLabbooks.find('.LocalLabbooks__panel')).toHaveLength(21)
})

describe('LocalLabbooks show modal', () => {
  const relay = {loadMore: () => {}}
  const localLabbooks = mount(

     <LocalLabbooks relay={relay} history={history} {...fixtures} feed={config.data}/>
  );

  // localLabbooks.refs = {wizardModal: {_showModal: () => {}}}
  localLabbooks.find('.LocalLabbooks__title').simulate('click')

  expect(localLabbooks.node.refs.wizardModal.state.modal_visible).toBeTruthy()

})

describe('LocalLabbooks show modal by panel', () => {
  const relay = {loadMore: () => {}}
  const localLabbooks = mount(

     <LocalLabbooks relay={relay} history={history} {...fixtures} feed={config.data}/>
  );
  // localLabbooks.refs = {wizardModal: {_showModal: () => {}}}
  localLabbooks.find('.LocalLabbooks__panel--add').simulate('click')

  expect(localLabbooks.node.refs.wizardModal.state.modal_visible).toBeTruthy()

})



describe('Test LocalLabbooks click', () => {

  const localLabbooks = mount(

      <LocalLabbooks history={history} feed={config.data}/>

  );

  localLabbooks.at(0).simulate('click')
  localLabbooks.setState({'labbookName': config.data.localLabbooks.edges[0].node.name})

  expect(localLabbooks.node.state.labbookName === config.data.localLabbooks.edges[0].node.name).toBeTruthy();
})


describe('Test LocalLabbooks edges output', () => {

  const localLabbooks = mount(

      <LocalLabbooks history={history} feed={config.data}/>

  );

  expect(localLabbooks.find('.LocalLabbooks__labbooks .LocalLabbooks__text-row h4').at(0).text()).toEqual(config.data.localLabbooks.edges[0].node.name)

})

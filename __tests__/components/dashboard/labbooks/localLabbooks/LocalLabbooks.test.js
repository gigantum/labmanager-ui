import React from 'react'
import renderer from 'react-test-renderer';
import {shallow, mount} from 'enzyme';
import history from 'JS/history'
import {StaticRouter, Link} from 'react-router';
import json from './__relaydata__/LocalLabbooks.json'
import LocalLabbooks from 'Components/dashboard/labbooks/localLabbooks/LocalLabbooks';
import relayTestingUtils from 'relay-testing-utils'
import {MemoryRouter } from 'react-router-dom'
import environment from 'JS/createRelayEnvironment'

const variables = {first:20}

const fixtures = {
  localLabbooks: json.data.localLabbooks
}

test('Test LocalLabbooks rendering', () => {

  const localLabbooks = renderer.create(

     relayTestingUtils.relayWrap(<LocalLabbooks history={history} {...fixtures} feed={json.data}/>, {}, json.data)

  );

  const tree = localLabbooks.toJSON()

  expect(tree).toMatchSnapshot()
})


describe('Test LocalLabbooks panel length', () => {

  const localLabbooks = shallow(

     <LocalLabbooks history={history} {...fixtures} feed={json.data}/>

  );

  expect(localLabbooks.find('.LocalLabbooks__panel')).toHaveLength(22)
})


describe('Test LocalLabbooks load more', () => {
  const relay = {loadMore: () => {}}
  const localLabbooks = mount(

     <LocalLabbooks relay={relay} history={history} {...fixtures} feed={json.data}/>

  );

  expect(localLabbooks.find('.LocalLabbooks__panel')).toHaveLength(22)
})

describe('LocalLabbooks show modal', () => {
  const relay = {loadMore: () => {}}
  const localLabbooks = mount(

     <LocalLabbooks relay={relay} history={history} {...fixtures} feed={json.data}/>
  );

  localLabbooks.find('.LocalLabbooks__title').simulate('click')

  expect(localLabbooks.node.refs.wizardModal.state.modal_visible).toBeTruthy()

})

describe('LocalLabbooks show modal by panel', () => {
  const relay = {loadMore: () => {}}
  const localLabbooks = mount(

     <LocalLabbooks relay={relay} history={history} {...fixtures} feed={json.data}/>
  );
  localLabbooks.find('.LocalLabbooks__panel--add').simulate('click')

  expect(localLabbooks.node.refs.wizardModal.state.modal_visible).toBeTruthy()

})



describe('Test LocalLabbooks click', () => {

  const localLabbooks = mount(

      <LocalLabbooks history={history} feed={json.data}/>

  );

  localLabbooks.at(0).simulate('click')
  localLabbooks.setState({'labbookName': json.data.localLabbooks.edges[0].node.name})

  expect(localLabbooks.node.state.labbookName === json.data.localLabbooks.edges[0].node.name).toBeTruthy();
})


describe('Test LocalLabbooks edges output', () => {

  const localLabbooks = mount(

      <LocalLabbooks history={history} feed={json.data}/>

  );

  expect(localLabbooks.find('.LocalLabbooks__labbooks .LocalLabbooks__text-row h4').at(0).text()).toEqual(json.data.localLabbooks.edges[0].node.name)

})
describe('Test scroll functon', () => {

  const localLabbooks = mount(

      <LocalLabbooks history={history} feed={json.data}/>

  );

  localLabbooks.find('.LocalLabbooks__panel').at(20).simulate('scroll')



  expect(localLabbooks.find('.LocalLabbooks__panel')).toHaveLength(22)

})




export default variables

import React from 'react'
import renderer from 'react-test-renderer';
import {shallow, mount} from 'enzyme';
import history from 'JS/history'

//import json from './__relaydata__/RemoteLabbooks.json'
import RemoteLabbooks from 'Components/dashboard/labbooks/remoteLabbooks/RemoteLabbooks';
import relayTestingUtils from 'relay-testing-utils'


const variables = {first:20}
let json = {data: {}}
const fixtures = {
  remoteLabbooks: json.data.remoteLabbooks
}



test('Test RemoteLabbooks rendering', () => {

  const localLabbooks = renderer.create(

     //relayTestingUtils.relayWrap(<RemoteLabbooks history={history} {...fixtures} feed={json.data}/>, {}, json.data)

  );

  const tree = localLabbooks.toJSON()

  expect(tree).toMatchSnapshot()
})


describe('Test RemoteLabbooks panel length', () => {

  const localLabbooks = shallow(

     <RemoteLabbooks history={history} {...fixtures} feed={json.data}/>

  );

  expect(localLabbooks.find('.RemoteLabbooks__panel')).toHaveLength(22)
})


describe('Test RemoteLabbooks load more', () => {
  const relay = {loadMore: () => {}}
  const localLabbooks = mount(

     <RemoteLabbooks relay={relay} history={history} {...fixtures} feed={json.data}/>

  );

  expect(localLabbooks.find('.RemoteLabbooks__panel')).toHaveLength(22)
})

describe('RemoteLabbooks show modal', () => {
  const relay = {loadMore: () => {}}
  const localLabbooks = mount(

     <RemoteLabbooks relay={relay} history={history} {...fixtures} feed={json.data}/>
  );

  localLabbooks.find('.RemoteLabbooks__title').simulate('click')

  expect(localLabbooks.node.refs.wizardModal.state.modal_visible).toBeTruthy()

})

describe('RemoteLabbooks show modal by panel', () => {
  const relay = {loadMore: () => {}}
  const localLabbooks = mount(

     <RemoteLabbooks relay={relay} history={history} {...fixtures} feed={json.data}/>
  );
  localLabbooks.find('.RemoteLabbooks__panel--add').simulate('click')

  expect(localLabbooks.node.refs.wizardModal.state.modal_visible).toBeTruthy()

})



describe('Test RemoteLabbooks click', () => {

  const localLabbooks = mount(

      <RemoteLabbooks history={history} feed={json.data}/>

  );

  localLabbooks.at(0).simulate('click')
  localLabbooks.setState({'labbookName': json.data.localLabbooks.edges[0].node.name})

  expect(localLabbooks.node.state.labbookName === json.data.localLabbooks.edges[0].node.name).toBeTruthy();
})


describe('Test RemoteLabbooks edges output', () => {

  const localLabbooks = mount(

      <RemoteLabbooks history={history} feed={json.data}/>

  );

  expect(localLabbooks.find('.RemoteLabbooks__labbooks .RemoteLabbooks__text-row h4').at(0).text()).toEqual(json.data.localLabbooks.edges[0].node.name)

})
describe('Test scroll functon', () => {

  const localLabbooks = mount(

      <RemoteLabbooks history={history} feed={json.data}/>

  );
  //console.log(localLabbooks.find('.RemoteLabbooks__panel').at(20))
  localLabbooks.find('.RemoteLabbooks__panel').at(20).simulate('scroll')



  expect(localLabbooks.find('.RemoteLabbooks__panel')).toHaveLength(22)

})




export default variables

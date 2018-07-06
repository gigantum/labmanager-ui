//vendor
import React from 'react'
import renderer from 'react-test-renderer';
import {shallow, mount} from 'enzyme';
import relayTestingUtils from 'relay-testing-utils'
//Data
import json from './__relaydata__/RemoteLabbooks.json'
//history
import history from 'JS/history'
//components
import RemoteLabbooks from 'Components/dashboard/labbooks/remoteLabbooks/RemoteLabbooks';

const variables = {first:20}

const fixtures = {
  remoteLabbooks: json.data.labbookList.remoteLabbooks.edges[0]
}



test('Test RemoteLabbooks rendering', () => {

  const localLabbooks = renderer.create(

     relayTestingUtils.relayWrap(
       <RemoteLabbooks history={history} {...fixtures} feed={json.data}/>, {}, json.data
     )

  );

  const tree = localLabbooks.toJSON()

  expect(tree).toMatchSnapshot()
})




export default variables

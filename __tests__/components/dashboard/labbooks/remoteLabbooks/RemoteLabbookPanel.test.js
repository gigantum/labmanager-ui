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
import RemoteLabbookPanel from 'Components/dashboard/labbooks/remoteLabbooks/RemoteLabbookPanel';

const variables = {first:20}

const fixtures = {
  remoteLabbooks: json.data.labbookList.remoteLabbooks,
  toggleDeleteModal: ()=>{},
  labbookListId: json.data.labbookList.remoteLabbooks.id,
  className: "LocalLabbooks__panel",
  edge: json.data.labbookList.remoteLabbooks.edges[0],
  histor: history,
  existsLocally: json.data.labbookList.remoteLabbooks.edges[0].node.isLocal,
  auth: {
    login: ()=>{
    }
  }
}



test('Test RemoteLabbooks rendering', () => {

  const localLabbooks = renderer.create(

     relayTestingUtils.relayWrap(
       <RemoteLabbookPanel {...fixtures} />, {}, json.data
     )

  );

  const tree = localLabbooks.toJSON()

  expect(tree).toMatchSnapshot()
})




export default variables

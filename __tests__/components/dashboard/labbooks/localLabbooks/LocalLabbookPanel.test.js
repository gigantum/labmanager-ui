import React from 'react'
import renderer from 'react-test-renderer';
import {shallow, mount} from 'enzyme';
import history from 'JS/history'
import {StaticRouter, Link} from 'react-router';
import json from './__relaydata__/LocalLabbooks.json'
import LocalLabbookPanel from 'Components/dashboard/labbooks/localLabbooks/LocalLabbookPanel';
import relayTestingUtils from 'relay-testing-utils'
import {MemoryRouter } from 'react-router-dom'
import environment from 'JS/createRelayEnvironment'

const variables = {first:5}


const fixtures = {
  props: json.data.labbookList.localLabbooks[0]
}

test('Test LocalLabbooks rendering', () => {

  const localLabbooks = renderer.create(

     relayTestingUtils.relayWrap(<LocalLabbookPanel history={history} {...fixtures} feed={json.data.localLabbooks.edges[0]}/>, {}, json.data.localLabbooks[0])

  );

  const tree = localLabbooks.toJSON()

  expect(tree).toMatchSnapshot()
})

export default variables

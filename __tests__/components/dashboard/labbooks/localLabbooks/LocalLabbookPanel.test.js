import React from 'react'
import renderer from 'react-test-renderer';
import {shallow, mount} from 'enzyme';
import history from 'JS/history'
import {StaticRouter, Link} from 'react-router';
import json from './__relaydata__/LocalLabbooks.json'
import LocalLabbooksPanel from 'Components/dashboard/labbooks/localLabbooks/LocalLabbooksPanel';
import relayTestingUtils from 'relay-testing-utils'
import {MemoryRouter } from 'react-router-dom'
import environment from 'JS/createRelayEnvironment'

const variables = {first:5}


const fixtures = {
  props: json.data.localLabbooks[0]
}

test('Test LocalLabbooks rendering', () => {

  const localLabbooks = renderer.create(

     relayTestingUtils.relayWrap(<LocalLabbooksPanel history={history} {...fixtures} feed={json.data}/>, {}, json.data)

  );

  const tree = localLabbooks.toJSON()

  expect(tree).toMatchSnapshot()
})

export default variables

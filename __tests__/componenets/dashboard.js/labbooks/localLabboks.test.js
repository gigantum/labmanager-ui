import React from 'react'
import renderer from 'react-test-renderer';
import {shallow, mount} from 'enzyme';
import history from 'JS/history'
import {StaticRouter, Link} from 'react-router';
import config from './config'
import {Local} from 'Components/dashboard/labbooks/localLabbooks';
import relayTestingUtils from 'relay-testing-utils'

import environment from 'JS/createRelayEnvironment'

const fixtures = {
  localLabbooks: config.data.localLabbooks
}

test('Test LocalLabbooks', () => {

  const localLabbooks = renderer.create(

     relayTestingUtils.relayWrap(<Local history={history} {...fixtures} feed={config.data}/>)

  );

  const tree = localLabbooks.toJSON()

  expect(tree).toMatchSnapshot()
})


describe('Test LocalLabbooks', () => {

  const localLabbooks = shallow(

     <Local history={history} {...fixtures} feed={config.data}/>

  );


  localLabbooks.find('.LocalLabbooks__panel').simulate('click')
  //
  expect(localLabbooks.find('.LocalLabbooks__panel')).to.have.length(21)
})



describe('Test LocalLabbooks', () => {

  const localLabbooks = shallow(

     <Local history={history} {...fixtures} feed={config.data}/>

  );


  let labbook = localLabbooks.find('.LocalLabbooks__panel').nodes[0];


  labbook.props.onClick()

  //expect(localLabbooks).toBeTruthy();
})

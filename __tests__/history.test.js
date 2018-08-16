import React from 'react'
import history from 'JS/history';
import {shallow} from 'enzyme'
import Dashboard from 'Components/dashboard/Dashboard'

describe('Test create history', () => {
  it('has a replace method', () => {

    expect(typeof history.replace === 'function').toBeTruthy()
  })

  it('has a replace method', () => {
    history.replace('labbooks/')
    const renderedComponent = shallow(
      <Dashboard history={history} footerWorkerCallback={() => {}} match={{
        params: {
          id: 'labbbooks'
        }
      }}/>)
    expect(renderedComponent).toMatchSnapshot()
    //expect(history.).toBeTruthy()
  })

  it('has a replace method', () => {
    history.replace('datasets/')
    const renderedComponent = shallow(
      <Dashboard history={history} footerWorkerCallback={() => {}} match={{
        params: {
          id: 'datasets'
        }
      }}/>)
    expect(renderedComponent).toMatchSnapshot()
    //expect(history.).toBeTruthy()
  })

});

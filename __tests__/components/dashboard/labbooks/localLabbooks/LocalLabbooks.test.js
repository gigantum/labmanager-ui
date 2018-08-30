import React from 'react'
import renderer from 'react-test-renderer';
import {configure, shallow, mount} from 'enzyme';
import sinon from 'sinon';
import history from 'JS/history'
import {StaticRouter, Link} from 'react-router';
import json from './__relaydata__/LocalLabbooks.json'
import LocalLabbooks from 'Components/dashboard/labbooks/localLabbooks/LocalLabbooks';
import relayTestingUtils from 'relay-testing-utils'
import {MemoryRouter } from 'react-router-dom'
import environment from 'JS/createRelayEnvironment'
import {Provider} from 'react-redux'
import store from 'JS/redux/store'
import {BrowserRouter as Router} from 'react-router-dom'

import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

const variables = {first:20}

store.dispatch({
  type: 'SET_FILTER_TEXT',
  payload: {
    filterText: ''
  }
})

const showModal = () =>{

}

const goToLabbook = () =>{

}

const filterLabbooks = (labbooks, filter) =>{
  let filteredLabbooks = [];
  let username = localStorage.getItem('username')
  if(filter === username){
    filteredLabbooks = labbooks.filter((labbook)=>{
        return (labbook.node.owner === username)
    })

  }else if(filter === "others"){
    filteredLabbooks = labbooks.filter((labbook)=>{
        return (labbook.node.owner !== username)
    })
  }else{
    filteredLabbooks = labbooks;
  }

  return filteredLabbooks
}

const changeRefetchState = () =>{

}

const sortProcessed = () => {

}

const loadMore = (props, value, ha) => {

  let labbooks = json.data.labbookList.localLabbooks
  labbooks.edges = labbooks.edges.slice(0, 5)
  return labbooks
}

let labbookList = json.data.labbookList
labbookList.localLabbooks.edges = labbookList.localLabbooks.edges.slice(0, 5)

const fixtures = {
  localLabbooks: labbookList,
  wasSorted: false,
  sort: 'modified_on',
  reverse: false,
  labbookListId: json.data.labbookList.id,
  filterState: 'all',
  section: 'local',
  loading: false,
  showModal,
  goToLabbook,
  filterLabbooks,
  changeRefetchState,
  sortProcessed,
  history
}


describe('LocalLabbooks', () => {

  it('LocalLabbooks snapshot', () => {

    const localLabbooksSnap = renderer.create(

       relayTestingUtils.relayWrap(
        <Provider store={store}>
          <Router>
            <LocalLabbooks

              {...fixtures}

            />
          </Router>
        </Provider>, {}, json.data.labbookList)

    )

    const tree = localLabbooksSnap.toJSON()

    expect(tree).toMatchSnapshot()

  })

  /****
   *
   * Shallow
   * Run shallow tests here
   *
   *
   *****/
  const localLabbooksShallow = mount(
    <Provider store={store}>
     <Router>
      <LocalLabbooks history={history} {...fixtures} feed={json.data}/>
     </Router>
    </Provider>

  );


  it('LocalLabbooks panel length', () => {


    expect(localLabbooksShallow.find('.LocalLabbooks__panel')).toHaveLength(16)
  })



  /****
   *
   * Mount
   * Run shallow tests here
   *
   *
   *****/
  const showModalTest = sinon.spy();
  const goToLabbookTest = sinon.spy();
  const sortProcessedTest = sinon.spy();

  const localLabbooksMount = mount(
    relayTestingUtils.relayWrap(
      <Provider store={store}>
        <Router>
          <LocalLabbooks
            {...fixtures}
            showModal={showModalTest}
            goToLabbook={goToLabbookTest}
            sortProcessed={sortProcessedTest}
            relay={{loadMore: loadMore}}
          />
       </Router>
      </Provider>, {}, json.data.labbookList
     )
  );

  it('Simulates sort processed', () => {

    expect(sortProcessedTest).toHaveProperty('callCount', 0);
  });

  it('Simulates opening create labbook', () => {

    localLabbooksMount.find('.Labbooks__labbook-button').simulate('click');

    expect(showModalTest).toHaveProperty('callCount', 1);
  });


  it('Simulates opening a labbook', () => {

    localLabbooksMount.find('.LocalLabbooks__panel').at(4).simulate('click');


    expect(goToLabbookTest).toHaveProperty('callCount', 1);
  });


  // it('Simulates pagination', () => {
  //
  //   // console.log(localLabbooksMount)
  //   // console.log( localLabbooksMount.instance())
  //   //window.dispatchEvent(new window.UIEvent('scroll', { detail: 1800}))
  //   //localLabbooksMount.instance()._loadMore()
  //
  //   // expect(window.screenTop).toBe(1800)
  // });



  // describe('LocalLabbooks load more', () => {
  //   const relay = {loadMore: () => {}}
  //
  //   expect(localLabbooksMount.find('.LocalLabbooks__panel')).toHaveLength(22)
  // })
  //
  // describe('LocalLabbooks show modal', () => {
  //   const relay = {loadMore: () => {}}
  //   const localLabbooks = mount(
  //
  //      <LocalLabbooks relay={relay} history={history} {...fixtures} feed={json.data}/>
  //   );
  //
  //   localLabbooks.find('.LocalLabbooks__title').simulate('click')
  //
  //   expect(localLabbooks.node.refs.wizardModal.state.modal_visible).toBeTruthy()
  //
  // })
  //
  // describe('LocalLabbooks show modal by panel', () => {
  //   const relay = {loadMore: () => {}}
  //   const localLabbooks = mount(
  //
  //      <LocalLabbooks relay={relay} history={history} {...fixtures} feed={json.data}/>
  //   );
  //   localLabbooks.find('.LocalLabbooks__panel--add').simulate('click')
  //
  //   expect(localLabbooks.node.refs.wizardModal.state.modal_visible).toBeTruthy()
  //
  // })
  //
  //
  //
  // describe('Test LocalLabbooks click', () => {
  //
  //   const localLabbooks = mount(
  //
  //       <LocalLabbooks history={history} feed={json.data}/>
  //
  //   );
  //
  //   localLabbooks.at(0).simulate('click')
  //   localLabbooks.setState({'labbookName': json.data.localLabbooks.edges[0].node.name})
  //
  //   expect(localLabbooks.node.state.labbookName === json.data.localLabbooks.edges[0].node.name).toBeTruthy();
  // })
  //
  //
  // describe('Test LocalLabbooks edges output', () => {
  //
  //   const localLabbooks = mount(
  //
  //       <LocalLabbooks history={history} feed={json.data}/>
  //
  //   );
  //
  //   expect(localLabbooks.find('.LocalLabbooks__labbooks .LocalLabbooks__text-row h4').at(0).text()).toEqual(json.data.localLabbooks.edges[0].node.name)
  //
  // })
  // describe('Test scroll functon', () => {
  //
  //   const localLabbooks = mount(
  //
  //       <LocalLabbooks history={history} feed={json.data}/>
  //
  //   );
  //
  //   localLabbooks.find('.LocalLabbooks__panel').at(20).simulate('scroll')
  //
  //
  //
  //   expect(localLabbooks.find('.LocalLabbooks__panel')).toHaveLength(22)
  //
  // })
})



export default variables

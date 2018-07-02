import Labbook from 'Components/labbook/Labbook';
import React from 'react';
import config from './../../config'
import renderer from 'react-test-renderer';

import {LabbookQuery} from 'Components/Routes'
import { mount, shallow } from 'enzyme';
import Auth from 'JS/Auth/Auth';
import history from 'JS/history'
import {BrowserRouter as Router} from 'react-router-dom'
const auth = new Auth();

const variables = {first:20, labbook: 'demo-lab-book'}
export default variables


auth.isAuthenticated = function(){return true};

describe('labbook component', ()=>{


  it('Test Labbook Rendering', async () => {
        const component = await renderer.create(
          <Router history={Router}>
            <Labbook
              key={'demo-lab-book'}
              auth={auth}
              history={history}
              labbookName={'demo-lab-book'}
              location={{pathname: '/demo-lab-book'}}
              //labbook={config.data.labbook}
              match={{params: {labbook_name: 'demo-labbook-2'}}}/>
          </Router>
        )


        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();
  })

  it('Test nav item default state', async () =>{

    let labbook = await mount(
      <Router>
        <Labbook
          key={'demo-lab-book'}
          auth={auth}
          history={history}
          labbookName={'demo-lab-book'}
          location={{pathname: '/demo-lab-book'}}
          labbook={config.data.labbook}
          match={{params: {labbook_name: 'demo-labbook-2'}}}/>
       </Router>
    )

      labbook.find('.Labbook__navigation-item--data').simulate('click')


      expect(labbook.find('.selected').text() === 'Data').toBeTruthy()
  })
})

describe('Test nav item default state', async () =>{

  let labbook = await mount(
    <Router history={Router}>
      <Labbook
        key={'demo-lab-book'}
        auth={auth}
        history={history}
        labbookName={'demo-lab-book'}
        location={{pathname: '/demo-lab-book'}}
        labbook={config.data.labbook}
        match={{params: {labbook_name: 'demo-labbook-2'}}}/>
      </Router>
  )

    it('Test nav item data click',  () =>{
      labbook.find('#data').simulate('click')
      expect(labbook.find('.selected').text() === 'Data').toBeTruthy()
    })

    it('Test nav item notes click', () =>{
      labbook.find('#notes').simulate('click')
      expect(labbook.find('.selected').text() === 'Notes').toBeTruthy()
    })

    it('Test nav item code click',  () =>{
      labbook.find('#code').simulate('click')
      expect(labbook.find('.selected').text() === 'Code').toBeTruthy()
    })

    it('Test nav item overview click', () =>{
      labbook.find('#overview').simulate('click')
      expect(labbook.find('.selected').text() === 'Overview').toBeTruthy()
    })

    it('Test nav item environment click', () =>{
      labbook.find('#environment').simulate('click')
      expect(labbook.find('.selected').text() === 'Environment').toBeTruthy()
    })

    it('Test nav item usernote open', () =>{
      labbook.find('.UserNote__close').simulate('click')

      expect(labbook.state.modalVisible).toBeTruthy()
    })
    it('Test nav item usernote close', () =>{
      labbook.find('.Labbook__user-note--add').simulate('click')
      expect(!labbook.state.modalVisible).toBeTruthy()
    })
})

import UserNote from 'Components/labbook/UserNote';
import React from 'react';
import config from './config'
import renderer from 'react-test-renderer';
import { mount, shallow } from 'enzyme';
import sinon from 'sinon'

import {MemoryRouter } from 'react-router-dom'

const variables = {first:20}
export default variables

let _hideLabbookModal = () =>{
  console.log('called')
}

test('Test User Note Rendering', () => {
      let props = {}
      const component = mount(
          <div>
            <div id={'markDown'}></div>
            <UserNote
              labbookId={'id'}
              labbookName={"demo-lab-book"}
              hideLabbookModal={_hideLabbookModal}
            />
        </div>
      )

      expect(component.node).toMatchSnapshot();
})

describe('Test Container Rendering Building', () => {
      let props = {}

      const component = mount(

            <UserNote
              labbookId={'id'}
              labbookName={"demo-lab-book"}
              hideLabbookModal={_hideLabbookModal}
            />,  { attachTo: document.body }
      )

      it('test title input', ()=> {
        const mockedEvent = { target: {value: 'labbook'} }
        component.find('#UserNoteTitle').simulate('keyup', mockedEvent)

        expect(component.state('userSummaryText') === 'labbook').toBeTruthy()
      })

      it('test tag input', ()=> { //TODO fix input issues
        const mockedEnterEvent = {
          keyCode: 13,
          which: 13,
          key: "Enter",
          target: {value: 'tag'}
        }


        component.find('#TagsInput').simulate('keydown', {target: {value: 'tag'}})
        //console.log(component.find('#TagsInput'))
        component.find('#TagsInput').simulate('keydown', mockedEnterEvent)
        //console.log(component.node.state.tags)
        //expect(component.node).toMatchSnapshot();
      })


      it('test add note mutation', ()=> { //todo fix addnote
        const mockedEnterEvent = {
          keyCode: 13,
          which: 13,
          key: "ENTER",
          target: {value: 'tag'}
        }

        component.find('.UserNote__add-note').simulate('click')
        console.log(component)
      //  expect(component.node).toMatchSnapshot();
      })

})

test('Test Dashboard Labbooks calls component did mount', () => {
  sinon.spy(UserNote.prototype, 'componentDidMount');
  const usernote = shallow(
    <UserNote match={{params: {id: 'labbbooks'}}}/>
  );

  //expect(UserNote.prototype.componentDidMount.calledOnce).toEqual(true);

});

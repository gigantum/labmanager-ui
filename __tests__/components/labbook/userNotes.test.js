import UserNote from 'Components/labbook/UserNote';
import React from 'react';
import config from './config'
import renderer from 'react-test-renderer';
import { mount, shallow } from 'enzyme';

import {MemoryRouter } from 'react-router-dom'


let _hideLabbookModal = () =>{

}
console.log(UserNote)
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
            />
      )

      it('test title input', ()=> {
        const mockedEvent = { target: {value: 'labbook'} }
        component.find('#UserNoteTitle').simulate('keyup', mockedEvent)

        expect(component.state('userSummaryText') === 'labbook').toBeTruthy()
      })

      it('test tag input', ()=> {
        const mockedEnterEvent = {
          keyCode: 13,
          which: 13,
          key: "ENTER"
        }


        component.find('#TagsInput').simulate('keyup', {target: {value: 'tag'}})

        component.find('#TagsInput').simulate('change', mockedEnterEvent)

        expect(component.node).toMatchSnapshot();
      })


      it('test add note mutation', ()=> {
        const mockedEnterEvent = {
          keyCode: 13,
          which: 13,
          key: "ENTER"
        }


        component.find('.UserNote__add-note').simulate('click')

        expect(component.node).toMatchSnapshot();
      })

})


      import React from 'react'
      import renderer from 'react-test-renderer';
      import {mount} from 'enzyme'
      import CodeFavorites from 'Components/labbook/code/CodeFavorites';

      import json from './__relaydata__/CodeFavorites.json'

      import relayTestingUtils from 'relay-testing-utils'


      const setContainerState = () =>{

      }

      const fixtures = {
        labbook: json.data.labbook,
        labbookId: json.data.labbook.id,
        isLocked: false,
        setContainerState
      }


      test('Test CodeFavorites', () => {

        const wrapper = renderer.create(

           relayTestingUtils.relayWrap(
             <CodeFavorites />, {}, json.data.labbook.code)

        );

        const tree = wrapper.toJSON()

        expect(tree).toMatchSnapshot()

      })

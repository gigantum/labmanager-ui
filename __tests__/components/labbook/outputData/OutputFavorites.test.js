
      import React from 'react'
      import renderer from 'react-test-renderer';
      import {mount} from 'enzyme'
      import OutputFavorites from 'Components/labbook/outputData/OutputFavorites';

      import relayTestingUtils from 'relay-testing-utils'

      import json from './__relaydata__/OutputFavorites.json'


      const setContainerState = () =>{

      }

      const fixtures = {
        labbook: json.data.labbook,
        labbookId: json.data.labbook.id,
        isLocked: false,
        setContainerState
      }

      test('Test InputFavorites', () => {

        const wrapper = renderer.create(

           <OutputFavorites {...fixtures}/>

        );

        const tree = wrapper.toJSON()

        expect(tree).toMatchSnapshot()

      })

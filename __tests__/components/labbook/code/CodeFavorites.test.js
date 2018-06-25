
      import React from 'react'
      import renderer from 'react-test-renderer';
      import {mount} from 'enzyme'
      import CodeFavorites from 'Components/labbook/code/CodeFavorites';

<<<<<<< HEAD
      import relayTestingUtils from 'relay-testing-utils'
=======
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

>>>>>>> batch-dependencies

      test('Test CodeFavorites', () => {

        const wrapper = renderer.create(

<<<<<<< HEAD
           <CodeFavorites />
=======
           relayTestingUtils.relayWrap(
             <CodeFavorites />, {}, json.data.labbook.code)
>>>>>>> batch-dependencies

        );

        const tree = wrapper.toJSON()

        expect(tree).toMatchSnapshot()

<<<<<<< HEAD
      })
=======
      })
>>>>>>> batch-dependencies

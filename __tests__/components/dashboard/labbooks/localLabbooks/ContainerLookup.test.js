
      import React from 'react'
      import renderer from 'react-test-renderer'
      import {mount} from 'enzyme'
      import json from './__relaydata__/LocalLabbooks.json'
      import ContainerLookup from 'Components/dashboard/labbooks/localLabbooks/ContainerLookup';

      import relayTestingUtils from 'relay-testing-utils'

      test('Test ContainerLookup', async () => {

        let id = json.data.labbookList.localLabbooks.edges[0].node.id
        ContainerLookup.query([id]).then((response)=>{

          expect(response.data.ids.length).toEqual(0)
        })

      })

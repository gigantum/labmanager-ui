
      import React from 'react'
      import renderer from 'react-test-renderer';
      import {mount} from 'enzyme'
      import ContainerLookup from 'Components/dashboard/labbooks/localLabbooks/ContainerLookup';

      import relayTestingUtils from 'relay-testing-utils'

      test('Test ContainerLookup', () => {

        const wrapper = renderer.create(

           <ContainerLookup />

        );

        const tree = wrapper.toJSON()

        expect(tree).toMatchSnapshot()

      })
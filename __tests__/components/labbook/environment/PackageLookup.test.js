
      import React from 'react'
      import renderer from 'react-test-renderer';
      import {mount} from 'enzyme'
      import PackageLookup from 'Components/labbook/environment/PackageLookup';

      import relayTestingUtils from 'relay-testing-utils'

      test('Test PackageLookup', () => {

        const wrapper = renderer.create(

           <PackageLookup />

        );

        const tree = wrapper.toJSON()

        expect(tree).toMatchSnapshot()

      })
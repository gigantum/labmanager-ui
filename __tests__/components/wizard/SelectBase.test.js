
      import React from 'react'
      import renderer from 'react-test-renderer';
      import {mount} from 'enzyme'
      import SelectBase from 'Components/wizard/SelectBase';

      import relayTestingUtils from 'relay-testing-utils'

      test('Test SelectBase', () => {

        const wrapper = renderer.create(

           <SelectBase />

        );

        const tree = wrapper.toJSON()

        expect(tree).toMatchSnapshot()

      })

      import React from 'react'
      import renderer from 'react-test-renderer';
      import {mount} from 'enzyme'
      import MostRecentCode from 'Components/labbook/filesShared/MostRecentCode';

      import relayTestingUtils from 'relay-testing-utils'

      test('Test MostRecentCode', () => {

        const wrapper = renderer.create(

           <MostRecentCode />

        );

        const tree = wrapper.toJSON()

        expect(tree).toMatchSnapshot()

      })
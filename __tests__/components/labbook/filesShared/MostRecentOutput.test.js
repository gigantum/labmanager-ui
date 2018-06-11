
      import React from 'react'
      import renderer from 'react-test-renderer';
      import {mount} from 'enzyme'
      import MostRecentOutput from 'Components/labbook/filesShared/MostRecentOutput';

      import relayTestingUtils from 'relay-testing-utils'

      test('Test MostRecentOutput', () => {

        const wrapper = renderer.create(

           <MostRecentOutput />

        );

        const tree = wrapper.toJSON()

        expect(tree).toMatchSnapshot()

      })
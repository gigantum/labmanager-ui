
      import React from 'react'
      import renderer from 'react-test-renderer';
      import {mount} from 'enzyme'
      import MostRecentInput from 'Components/labbook/filesShared/MostRecentInput';

      import relayTestingUtils from 'relay-testing-utils'

      test('Test MostRecentInput', () => {

        const wrapper = renderer.create(

           <MostRecentInput />

        );

        const tree = wrapper.toJSON()

        expect(tree).toMatchSnapshot()

      })
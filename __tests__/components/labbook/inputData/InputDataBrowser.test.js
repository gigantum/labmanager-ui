
      import React from 'react'
      import renderer from 'react-test-renderer';
      import {mount} from 'enzyme'
      import InputDataBrowser from 'Components/labbook/inputData/InputDataBrowser';

      import relayTestingUtils from 'relay-testing-utils'

      test('Test InputDataBrowser', () => {

        const wrapper = renderer.create(

           <InputDataBrowser />

        );

        const tree = wrapper.toJSON()

        expect(tree).toMatchSnapshot()

      })
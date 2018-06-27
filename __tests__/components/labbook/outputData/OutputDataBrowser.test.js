
      import React from 'react'
      import renderer from 'react-test-renderer';
      import {mount} from 'enzyme'
      import OutputDataBrowser from 'Components/labbook/outputData/OutputDataBrowser';

      import relayTestingUtils from 'relay-testing-utils'

      test('Test OutputDataBrowser', () => {

        const wrapper = renderer.create(

           <OutputDataBrowser />

        );

        const tree = wrapper.toJSON()

        expect(tree).toMatchSnapshot()

      })
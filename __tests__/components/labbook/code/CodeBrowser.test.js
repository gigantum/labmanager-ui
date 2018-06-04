
      import React from 'react'
      import renderer from 'react-test-renderer';
      import {mount} from 'enzyme'
      import CodeBrowser from 'Components/labbook/code/CodeBrowser';

      import relayTestingUtils from 'relay-testing-utils'

      test('Test CodeBrowser', () => {

        const wrapper = renderer.create(

           <CodeBrowser />

        );

        const tree = wrapper.toJSON()

        expect(tree).toMatchSnapshot()

      })
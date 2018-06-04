
      import React from 'react'
      import renderer from 'react-test-renderer';
      import {mount} from 'enzyme'
      import FilePreview from 'Components/labbook/overview/FilePreview';

      import relayTestingUtils from 'relay-testing-utils'

      test('Test FilePreview', () => {

        const wrapper = renderer.create(

           <FilePreview />

        );

        const tree = wrapper.toJSON()

        expect(tree).toMatchSnapshot()

      })
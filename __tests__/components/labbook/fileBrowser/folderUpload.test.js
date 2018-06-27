
      import React from 'react'
      import renderer from 'react-test-renderer';
      import {mount} from 'enzyme'
      import folderUpload from 'Components/labbook/fileBrowser/folderUpload';

      import relayTestingUtils from 'relay-testing-utils'

      test('Test folderUpload', () => {

        const wrapper = renderer.create(

           <folderUpload />

        );

        const tree = wrapper.toJSON()

        expect(tree).toMatchSnapshot()

      })
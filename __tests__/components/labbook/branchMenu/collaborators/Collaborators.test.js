
      import React from 'react'
      import renderer from 'react-test-renderer';
      import {mount} from 'enzyme'
      import Collaborators from 'Components/labbook/branchMenu/collaborators/Collaborators';

      import relayTestingUtils from 'relay-testing-utils'

      test('Test Collaborators', () => {

        const wrapper = renderer.create(

           <Collaborators />

        );

        const tree = wrapper.toJSON()

        expect(tree).toMatchSnapshot()

      })
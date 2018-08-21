
      import React from 'react'
      import renderer from 'react-test-renderer';
      import {mount} from 'enzyme'
      import CollaboratorButton from 'Components/labbook/branchMenu/CollaboratorButton';

      import relayTestingUtils from 'relay-testing-utils'

      test('Test CollaboratorButton', () => {

        const wrapper = renderer.create(

           <CollaboratorButton />

        );

        const tree = wrapper.toJSON()

        expect(tree).toMatchSnapshot()

      })
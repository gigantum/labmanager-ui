
      import React from 'react'
      import renderer from 'react-test-renderer';
      import {mount} from 'enzyme'
      import UserIdentity from '/Auth/UserIdentity';

      import relayTestingUtils from 'relay-testing-utils'

      test('Test UserIdentity', () => {

        const wrapper = renderer.create(

           <UserIdentity />

        );

        const tree = wrapper.toJSON()

        expect(tree).toMatchSnapshot()

      })

      import React from 'react'
      import renderer from 'react-test-renderer';
      import {mount} from 'enzyme'
      import DashboardLocal from 'Components/dashboard/DashboardLocal';

      import relayTestingUtils from 'relay-testing-utils'

      test('Test DashboardLocal', () => {

        const wrapper = renderer.create(

           <DashboardLocal />

        );

        const tree = wrapper.toJSON()

        expect(tree).toMatchSnapshot()

      })
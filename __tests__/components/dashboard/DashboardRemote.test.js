
      import React from 'react'
      import renderer from 'react-test-renderer';
      import {mount} from 'enzyme'
      import DashboardRemote from 'Components/dashboard/DashboardRemote';

      import relayTestingUtils from 'relay-testing-utils'

      test('Test DashboardRemote', () => {

        const wrapper = renderer.create(

           <DashboardRemote />

        );

        const tree = wrapper.toJSON()

        expect(tree).toMatchSnapshot()

      })
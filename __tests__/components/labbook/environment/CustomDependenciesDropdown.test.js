
      import React from 'react'
      import renderer from 'react-test-renderer';
      import {mount} from 'enzyme'
      import CustomDependenciesDropdown from 'Components/labbook/environment/CustomDependenciesDropdown';

      import relayTestingUtils from 'relay-testing-utils'

      test('Test CustomDependenciesDropdown', () => {

        const wrapper = renderer.create(

           <CustomDependenciesDropdown />

        );

        const tree = wrapper.toJSON()

        expect(tree).toMatchSnapshot()

      })
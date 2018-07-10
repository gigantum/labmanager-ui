
      import React from 'react'
      import renderer from 'react-test-renderer';
      import {mount} from 'enzyme'
      import Activity from 'Components/labbook/activity/Activity';

      import json from './__relaydata__/Activity.json';

      import store from 'JS/redux/store'
      import relayTestingUtils from 'relay-testing-utils'

      const owner = 'cbutler'
      const labbookName = 'data-shader'
      store.dispatch({
        type: 'UPDATE_ALL',
        payload: {
          owner,
          labbookName
        }
      })

      let fixtures ={
        activityRecords: json.data.labbook.activityRecords,
        key: 'activitytest',
        labbook: json.data.labbook,
        labbookId: json.data.labbook.id,
        activeBranch: json.data.labbook.activeBranch,
        isMainWorkspace:(json.data.labbook.activeBranch === 'workspace')
      }

      test('Test Activity', () => {

        const wrapper = renderer.create(

          relayTestingUtils.relayWrap(
            <Activity

              {...fixtures}

            />, {}, json.data.labbook)

        );

        const tree = wrapper.toJSON()

        expect(tree).toMatchSnapshot()

      })

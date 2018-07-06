
      import React from 'react'
      import renderer from 'react-test-renderer';
      import history from 'JS/history'
      import {mount} from 'enzyme'
      import LocalLabbooksContainer from 'Components/dashboard/labbooks/localLabbooks/LocalLabbooksContainer';

      import json from './__relaydata__/DashboardLocal.json'

      import relayTestingUtils from 'relay-testing-utils'

      const fixtures = {
        auth: ()=>{

        },
        labbookList: json.data.labbookList,
        history: history,
        refetchSort: ()=>{

        }
      }

      test('Test DashboardLocal', () => {

        const wrapper = renderer.create(

           relayTestingUtils.relayWrap(<LocalLabbooksContainer {...fixtures} />, {}, json.data)

        );

        const tree = wrapper.toJSON()

        expect(tree).toMatchSnapshot()

      })

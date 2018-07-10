
      import React from 'react'
      import renderer from 'react-test-renderer';
      import history from 'JS/history'
      import {mount} from 'enzyme'
      import RemoteLabbooksContainer from 'Components/dashboard/labbooks/remoteLabbooks/RemoteLabbooksContainer';

      import json from './__relaydata__/DashboardRemote.json'

      import relayTestingUtils from 'relay-testing-utils'

      history.location.pathname = 'hostname/labbooks/cloud'

      const fixtures = {
        auth: ()=>{

        },
        labbookList: json.data,
        remoteLabbooks: json.data.labbookList,
        history: history,
        refetchSort: ()=>{

        }
      }

      test('Test DashboardRemote', () => {

        const wrapper = renderer.create(

           relayTestingUtils.relayWrap(<RemoteLabbooksContainer {...fixtures} />, {}, json.data)

        );


        const tree = wrapper.toJSON()

        expect(tree).toMatchSnapshot()

      })


      import React from 'react'
      import renderer from 'react-test-renderer';
      import history from 'JS/history'
      import {mount} from 'enzyme'
      import RemoteLabbooksContainer from 'Components/dashboard/labbooks/remoteLabbooks/RemoteLabbooksContainer';

      import json from './__relaydata__/DashboardRemote.json'

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

           relayTestingUtils.relayWrap(<RemoteLabbooksContainer {...fixtures} />, {}, json.data)

        );

        const component = wrapper.getInstance().setState({selectedSection: 'cloud'})
        console.log(component)
        const tree = component.toJSON()

        expect(component).toMatchSnapshot()

      })

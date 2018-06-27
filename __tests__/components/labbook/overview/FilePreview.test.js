
      import React from 'react'
      import renderer from 'react-test-renderer';
      import {mount} from 'enzyme'
      import FilePreview from 'Components/labbook/overview/FilePreview';

      import store from 'JS/redux/store'

      import json from './__relaydata__/FilePreview.json'

      import config from '../../../config'

      import relayTestingUtils from 'relay-testing-utils'

      const fixtures = {
        labbook: json.data.labbook
      }

      store.dispatch({
        type: 'UPDATE_ALL',
        payload: {
          labbookName: config.labbookName,
          owner: config.owner
        }
      })


      describe('Test FilePreview', () => {
        it('renders snapshot', ()=> {
          const wrapper = renderer.create(

             relayTestingUtils.relayWrap(<FilePreview {...fixtures} />, {}, json.data.labbook)

          );

          const tree = wrapper.toJSON()

          expect(tree).toMatchSnapshot()
        })


      })

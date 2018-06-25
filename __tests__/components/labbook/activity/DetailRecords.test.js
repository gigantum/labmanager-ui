
      import React from 'react'
      import renderer from 'react-test-renderer';
      import {mount} from 'enzyme'

<<<<<<< HEAD
      import json from './__relaydata__/DetailsRecords.json'
=======
      import json from './__relaydata__/DetailRecords.json'
>>>>>>> batch-dependencies
      import DetailRecords from 'Components/labbook/activity/DetailRecords';

      import relayTestingUtils from 'relay-testing-utils'

      test('Test DetailRecords', () => {

        const wrapper = renderer.create(

<<<<<<< HEAD
           relayTestingUtils.wrap(<DetailRecords />, {}, json.data.detailRecords)
=======
           relayTestingUtils.relayWrap(<DetailRecords />, {}, json.data.detailRecords)
>>>>>>> batch-dependencies

        );

        const tree = wrapper.toJSON()

        expect(tree).toMatchSnapshot()

      })

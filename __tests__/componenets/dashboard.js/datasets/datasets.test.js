import React from 'react'
import renderer from 'react-test-renderer';
import {mount} from 'enzyme'
import {DatasetSets} from 'Components/dashboard/datasets/DatasetSets';
import relayTestingUtils from 'relay-testing-utils'


test('Test Datasets', () => {

  const Datasets = renderer.create(

     relayTestingUtils.relayWrap(<DatasetSets />)

  );

  const tree = Datasets.toJSON()

  expect(tree).toMatchSnapshot()

})

import React from 'react'
import renderer from 'react-test-renderer';
import {mount} from 'enzyme'
import DatasetSets from 'Components/dashboard/datasets/DatasetSets';
import relayTestingUtils from 'relay-testing-utils'


test('Test Datasets', () => {

  const datasets = renderer.create(

     <DatasetSets />

  );

  const tree = datasets.toJSON()

  expect(tree).toMatchSnapshot()

})

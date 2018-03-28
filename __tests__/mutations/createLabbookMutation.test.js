
import CreateLabbookMutation from 'Mutations/createLabbookMutation';
import {
  testData
} from './createLabbookMutation.config.js'


test('Test Create Labbook Mutation untracked', done => {
  const isUntracked = true;

  CreateLabbookMutation(
      testData.name,
      testData.description,
      testData.repository,
      testData.componentId,
      testData.revision,
      isUntracked,
      (response, error) => {
        if(response){

          expect(response.createLabbook.labbook.name).toEqual(testData.name);
          done()
        }else{

          done.fail(new Error(error))
        }
      }
  )

})

test('Test Create Labbook Mutation labbook exists error', done => {
  const isUntracked = true;

  CreateLabbookMutation(
      testData.name,
      testData.description,
      testData.repository,
      testData.componentId,
      testData.revision,
      isUntracked,
      (response, error) => {

        if(response){

          expect(response.createLabbook).toEqual(null);
          done()
        }

        if(error){
          done.fail(new Error(error))
        }
      }
  )

})

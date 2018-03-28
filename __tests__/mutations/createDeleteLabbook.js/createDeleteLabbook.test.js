import DeleteLabbook from './../deleteLabbook';
import CreateLabbook from './../createLabbook';
import {
  testData
} from './../config.js'
import uuidv4 from 'uuid/v4'

const labbookName = uuidv4()

describe('Create && delete labbook', () => {

  test('Test Create Labbook Mutation untracked', done => {
    const isUntracked = true;

    CreateLabbook.createLabbook(
        labbookName,
        isUntracked,
        (response, error) => {
          if(response){

            expect(response.createLabbook.labbook.name).toEqual(labbookName);
            done()
          }else{

            done.fail(new Error(error))
          }
        }
    )

  })

  test('Test Delete Labbook Mutation confirm', done => {
    const confirm = true
    DeleteLabbook.deleteLabbook(
        labbookName,
        confirm,
        (response, error) => {
          if(response){

            expect(response.deleteLabbook.success).toEqual(true);
            done()
          }else{

            done.fail(new Error(error))
          }
        }
    )
  })

})

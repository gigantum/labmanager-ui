//vendor
import uuidv4 from 'uuid/v4'
// mutations
import DeleteLabbook from './../deleteLabbook';
import CreateLabbook from './../createLabbook';

const labbookName = uuidv4()

describe('Test Suite: Create && delete labbook', () => {

  test('Test: CreateLabbookMuation - Create Labbook Mutation untracked', done => {
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
  test('Test: CreateLabbookMuation - Create Labbook that already exists = invalid', done => {
    const isUntracked = false;

    CreateLabbook.createLabbook(
        labbookName,
        isUntracked,
        (response, error) => {
          if(error){
            expect(error).toBeTruthy();
            done()
          } else{
            done.fail();
          }
        }
    )

  })


  test('Test: DeleteLabbookMutation - Delete Labbook Mutation confirm', done => {

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

  test('Test: DeleteLabbookMutation - Delete invalid labbook', done => {

    const confirm = true

    DeleteLabbook.deleteLabbook(
        'invalid',
        confirm,
        (response, error) => {
          if(error){
            expect(error).toBeTruthy();
            done()
          } else{
            done.fail();
          }
        }
    )

  })

})

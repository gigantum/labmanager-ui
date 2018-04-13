//vendor
import uuidv4 from 'uuid/v4'
// mutations
import DeleteLabbook from './../deleteLabbook';
import CreateLabbook from './../createLabbook';
import CreateUserNote from './../createUserNote';

const labbookName = uuidv4()

describe('Test Suite: Create User Note', () => {

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

  test('Test: CreateUserNoteMutation - Create User Note', done => {

    CreateUserNote.createUserNote(
        labbookName,
        (response, error) => {
          if(response){

            expect(response.createUserNote).toBeTruthy();

            done()

          }else{

            done.fail(new Error(error))
          }

        }
    )

  })

  test('Test: CreateUserNoteMutation - Create User Note (error)', done => {

    CreateUserNote.createUserNote(
        'invalid',
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

})

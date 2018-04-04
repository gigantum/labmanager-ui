//vendor
import uuidv4 from 'uuid/v4'
// mutations
import DeleteLabbook from './../deleteLabbook';
import CreateLabbook from './../createLabbook';
import StartContainer from './../startContainer';

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

  test('Test: StartContainerMutation - Start Container', done => {
    const clientMutationId = 'clientMutationId';
    StartContainer.startContainer(
        labbookName,
        clientMutationId,
        (response, error) => {
          console.log(response, error)
          done()
          if(response){

            expect(response.startContainer).toBeTruthy();

            done()

          }else{

            done.fail(new Error(error))
          }

        }
    )

  })

  test('Test: StartContainerMutation - Start Container (error)', done => {
    const clientMutationId = 'clientMutationId';
    StartContainer.startContainer(
        'invalid',
        clientMutationId,
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

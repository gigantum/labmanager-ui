//vendor
import uuidv4 from 'uuid/v4'
// mutations
import DeleteLabbook from './../deleteLabbook';
import CreateLabbook from './../createLabbook';
import DeleteCollaborator from './../deleteCollaborator';

const labbookName = uuidv4()

describe('Test Suite: Delete Collaborator', () => {

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

  // test('Test: DeleteCollaboratorMutation - Delete Collaborator', done => {
  //   const username = '';
  //   DeleteCollaborator.deleteCollaborator(
  //       labbookName,
  //       username,
  //       (response, error) => {
  //         console.log(response, error)
  //         if(response){

  //           expect(response.createUserNote).toBeTruthy();

  //           done()

  //         }else{

  //           done.fail(new Error(error))
  //         }

  //       }
  //   )

  // })

  test('Test: DeleteCollaboratorMutation - Delete Collaborator (error)', done => {
    const username = ''
    DeleteCollaborator.deleteCollaborator(
        labbookName,
        username,
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

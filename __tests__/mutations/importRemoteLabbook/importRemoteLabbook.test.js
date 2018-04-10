//vendor
import uuidv4 from 'uuid/v4'
// mutations
import DeleteLabbook from './../deleteLabbook';
import ImportRemoteLabbook from './../importRemoteLabbook';

const labbookName = uuidv4()

describe('Test Suite: Import Remote Labbook', () => {

  // test('Test: ImportRemoteLabbookMutation - Import Remote Labbook', done => {

  //   ImportRemoteLabbook.importRemoteLabbook(
  //       (response, error) => {
  //         console.log(response, error)
  //         done();
  //         if(response){

  //           expect(response.renameLabbook).toBeTruthy();

  //           done()

  //         }else{

  //           done.fail(new Error(error))
  //         }

  //       }
  //   )

  // })

  test('Test: ImportRemoteLabbookMutation - Import Remote Labbook (error)', done => {

    ImportRemoteLabbook.importRemoteLabbook(
      (response, error) => {
        if (error) {
          expect(error).toBeTruthy();
          done()
        } else {
          done.fail();
        }
      }
    )

  })

  // test('Test: DeleteLabbookMutation - Delete Labbook Mutation confirm', done => {

  //   const confirm = true

  //   DeleteLabbook.deleteLabbook(
  //       labbookName,
  //       confirm,
  //       (response, error) => {

  //         if(response){

  //           expect(response.deleteLabbook.success).toEqual(true);

  //           done()

  //         }else{

  //           done.fail(new Error(error))

  //         }
  //       }
  //   )

  // })

})

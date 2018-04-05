//vendor
import uuidv4 from 'uuid/v4'
// mutations
import DeleteLabbook from './../deleteLabbook';
import CreateLabbook from './../createLabbook';
import ExportLabbook from './../exportLabbook';

const labbookName = uuidv4()

describe('Test Suite: Export Labbook', () => {

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

  test('Test: ExportLabbookMutation - Export Labbook', done => {

    ExportLabbook.exportLabbook(
        labbookName,
        (response, error) => {
          if(response){

            expect(response.exportLabbook).toBeTruthy();

            done()

          }else{

            done.fail(new Error(error))
          }

        }
    )

  })

  test('Test: ExportLabbookMutation - Export Labbook (error)', done => {

    ExportLabbook.exportLabbook(
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

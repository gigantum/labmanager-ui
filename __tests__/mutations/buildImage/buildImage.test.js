//vendor
import uuidv4 from 'uuid/v4'
// mutations
import BuildImage from './../buildImage';
import CreateLabbook from './../createLabbook';
import DeleteLabbook from './../deleteLabbook';

const labbookName = uuidv4()

describe('Test Suite: Build Image', () => {

  test('Test: CreateLabbookMutation - Create Labbook Mutation untracked', done => {
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

  test('Test: BuildImageMutation - Build Image', done => {
    const noCache = true;

    BuildImage.buildImage(
        labbookName,
        noCache,
        (response, error) => {
          if(response){

            expect(response.buildImage.clientMutationId).toEqual('0');

            done()

          }else{
            done.fail(new Error(error))
          }

        }
    )

  })

  test('Test: BuildImageMutation - Build Image handles error', done => {
    const noCache = true;

    BuildImage.buildImage(
        'invalid',
        noCache,
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

  test('Test: DeleteLabbookMutation - Delete Labbook Mutation', done => {

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

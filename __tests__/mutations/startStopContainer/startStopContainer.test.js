//vendor
import uuidv4 from 'uuid/v4'
import fs from 'fs'
import os from 'os'
// mutations
import DeleteLabbook from './../deleteLabbook';
import CreateLabbook from './../createLabbook';
import StartContainer from './../startContainer';
import StopContainer from './../stopContainer';
import BuildImage from './../buildImage';
import FetchContainerStatus from 'Components/labbook/containerStatus/fetchContainerStatus'
//config
import testConfig from './../config'

const labbookName = uuidv4()

describe('Test Suite: Start/Stop Container', () => {

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

  test('Test: StartContainerMutation - Start Container', done => {
    let owner = JSON.parse(fs.readFileSync(os.homedir() + testConfig.ownerLocation, 'utf8')).username
    const fetchStatus = () => {
      FetchContainerStatus.getContainerStatus(owner, labbookName).then((response, error)=>{
        if(response.labbook.environment.imageStatus === "EXISTS") {
          const clientMutationId = '0';
          StartContainer.startContainer(
              labbookName,
              clientMutationId,
              (response, error) => {
                done()
                if(response){

                  expect(response.startContainer).toBeTruthy();

                  done()

                }else{

                  done.fail(new Error(error))
                }

              }
          )
        }
        setTimeout(()=>{
          fetchStatus()
        }, 3 * 1000)
      })
    }
    fetchStatus();
  })

  test('Test: StartContainerMutation - Start Container (error)', done => {
    const clientMutationId = '0';
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

  test('Test: StopContainerMutation - Stop Container', done => {
    const clientMutationId = '0';
    StopContainer.stopContainer(
        labbookName,
        clientMutationId,
        (response, error) => {
          done()
          if(response){
            expect(response.stopContainer).toBeTruthy();
            done()
          }else{
            done.fail(new Error(error))
          }
        }
    )
  })

  test('Test: StopContainerMutation - Stop Container (error)', done => {
    const clientMutationId = '0';
    StopContainer.stopContainer(
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

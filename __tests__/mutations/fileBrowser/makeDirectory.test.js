//vendor
import fs from 'fs'
import os from 'os'
import uuidv4 from 'uuid/v4'
//mutations
import DeleteLabbook from './../deleteLabbook';
import CreateLabbook from './../createLabbook';
import MakeLabbookDirectoryMutation from 'Mutations/fileBrowser/MakeLabbookDirectoryMutation'
//config
import testConfig from './../config'


const owner = JSON.parse(fs.readFileSync(os.homedir() + testConfig.ownerLocation, 'utf8')).username
const labbookName = uuidv4()
const section = 'code'
const connectionKey = 'Code_allFiles'

let labbookId
describe('Test Suite: Make Labbook Directory', () => {
  test('Test: CreateLabbookMuation - Create Labbook Mutation untracked', done => {
    const isUntracked = true;

    CreateLabbook.createLabbook(
        labbookName,
        isUntracked,
        (response, error) => {
          if(response){
            labbookId = response.createLabbook.labbook.id
            expect(response.createLabbook.labbook.name).toEqual(labbookName);
            done()
          }else{
            console.log(error)
            done.fail(new Error(error))
          }
        }
    )

  })


  test('Test: MakeLabbookDirectoryMutation - Make Directory', done => {

    const directory = 'test_directory'

    MakeLabbookDirectoryMutation(
      connectionKey,
      owner,
      labbookName,
      labbookId,
      directory,
      section,
        (response, error) => {

          if(response){

            expect(response.makeLabbookDirectory.newLabbookFileEdge.node.key).toEqual(directory + '/');
            done()
          }else{
            console.log(error)
            done.fail(new Error(error))
          }
        }
    )

  })


    test('Test: MakeLabbookDirectoryMutation - Make Directory: Fail - Labbook does not exist', done => {

      const directory = 'test_directory'
      const fakeLabbookName = 'does-not-exist-labbook'

      MakeLabbookDirectoryMutation(
        connectionKey,
        owner,
        fakeLabbookName,
        labbookId,
        directory,
        section,
          (response, error) => {

            if(response && response.makeLabbookDirectory){

              expect(response.makeLabbookDirectory.newLabbookFileEdge.node.key).toEqual(directory + '/');

              done.fail(new Error('Mutation Should fail'))
            }else{
    
              expect(error[0].message).toMatch(/labbooks\/does-not-exist-labbook/);
              done()

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
            console.log(error)
            done.fail(new Error(error))
          }
        }
    )
  })
})

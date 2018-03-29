//vendor
import fs from 'fs'
import os from 'os'
import uuidv4 from 'uuid/v4'
//mutations
import DeleteLabbook from './../deleteLabbook';
import CreateLabbook from './../createLabbook';
import MakeLabbookDirectoryMutation from 'Mutations/fileBrowser/MakeLabbookDirectoryMutation'
import MoveLabbookFileMutation from 'Mutations/fileBrowser/MoveLabbookFileMutation'
//config
import testConfig from './../config'


const directory = 'test_directory'
const moveDirectory = 'test_directory_move'
const labbookName = uuidv4()
const owner = JSON.parse(fs.readFileSync(os.homedir() + testConfig.ownerLocation, 'utf8')).username
const section = 'code'
const connectionKey = 'Code_allFiles'

let edge
let labbookId

describe('Test Suite: Move Labbook File', () => {
  test('Test: CreateLabbookMutation - Create Labbook Mutation untracked', done => {
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


  test('Test: MakeLabbookDirectoryMutation - Make Directory to move', done => {

    MakeLabbookDirectoryMutation(
      connectionKey,
      owner,
      labbookName,
      labbookId,
      moveDirectory,
      section,
      (response, error) => {

        if(response){
          edge = response.makeLabbookDirectory.newLabbookFileEdge
          expect(response.makeLabbookDirectory.newLabbookFileEdge.node.key).toEqual(moveDirectory + '/');
          done()
        }else{
          console.log(error)
          done.fail(new Error(error))
        }
      }
    )

  })


  test('Test: MoveLabbookFileMutation - Move Directory', done => {

    const  newPath = `${directory}/${moveDirectory}`

    MoveLabbookFileMutation(
      connectionKey,
      owner,
      labbookName,
      labbookId,
      edge,
      moveDirectory,
      newPath,
      section,
      (response, error) => {

        if(response){

          expect(response.moveLabbookFile.newLabbookFileEdge.node.key).toEqual(newPath + '/');
          done()
        }else{
          console.log(error)
          done.fail(new Error(error))
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
          console.log(error)
          done.fail(new Error(error))
        }
      }
    )
  })
})

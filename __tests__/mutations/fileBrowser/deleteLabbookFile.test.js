import fs from 'fs'
import DeleteLabbook from './../deleteLabbook';
import CreateLabbook from './../createLabbook';
import MakeLabbookDirectoryMutation from 'Mutations/fileBrowser/MakeLabbookDirectoryMutation'
import DeleteLabbookFileMutation from 'Mutations/fileBrowser/DeleteLabbookFileMutation'
import {
  testData
} from './../config.js'
import os from 'os'
import uuidv4 from 'uuid/v4'

const directory = 'test_directory'
const labbookName = uuidv4()
const owner = JSON.parse(fs.readFileSync(os.homedir() + testData.ownerLocation, "utf8")).username
let edge

let labbookId

describe('delete labbook file', () => {
  test('Test Create Labbook Mutation untracked', done => {
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


  test('Test Make Directory', done => {

    MakeLabbookDirectoryMutation(
      "Code_allFiles",
      owner,
      labbookName,
      labbookId,
      directory,
      "code",
        (response, error) => {

          if(response){
            edge = response.makeLabbookDirectory.newLabbookFileEdge
            expect(response.makeLabbookDirectory.newLabbookFileEdge.node.key).toEqual(directory + '/');
            done()
          }else{
            console.log(error)
            done.fail(new Error(error))
          }
        }
    )
  })

  test('Test Delete Directory', done => {


    DeleteLabbookFileMutation(
      "Code_allFiles",
      owner,
      labbookName,
      labbookId,
      edge.node.id,
      directory,
      'code',
      edge,
      (response, error) => {

          if(response){

            expect(response.deleteLabbookFile.success).toEqual(true);
            done()
          }else{
            console.log(error)
            done.fail(new Error(error))
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

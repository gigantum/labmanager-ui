import fs from 'fs'
import DeleteLabbook from './../deleteLabbook';
import CreateLabbook from './../createLabbook';
import AddLabbookFileMutation from 'Mutations/fileBrowser/AddLabbookFileMutation'
import {
  testData
} from './../config.js'
import os from 'os'
import Blob from 'blob'
import uuidv4 from 'uuid/v4'

let owner = JSON.parse(fs.readFileSync(os.homedir() + testData.ownerLocation, "utf8")).username
const labbookName = uuidv4()


const awfulCitiesCheckpointNotebook = new Blob(fs.readFileSync(__dirname + '/data/awful-cities-checkpoint.ipynb'))
const size = awfulCitiesCheckpointNotebook.size

const chunk = {
  blob: awfulCitiesCheckpointNotebook,
  fileSizeKb: size,
  chunkSize: size,
  totalChunks: 1,
  chunkIndex: 1,
  filename: 'awful-cities-checkpoint.ipynb',
  id: uuidv4()
}
let labbookId

describe('Add labbook file', () => {
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

            done.fail(new Error(error))
          }
        }
    )

  })


  test('Test adding small file to file', done => {
    console.log(labbookId)
    AddLabbookFileMutation(
      "Code_allFiles",
      owner,
      testData.name,
      labbookId,
      'awful-cities-checkpoint.ipynb',
      chunk,
      testData.accessToken,
      "code",
        (response, error) => {
          if(response){

            expect(response.createLabbook.labbook.name).toEqual(testData.name);
            done()
          }else{

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

            done.fail(new Error(error))
          }
        }
    )
  })
})

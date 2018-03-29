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
const labbookName = 'herehere'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const awfulCitiesCheckpointNotebook = fs.readFileSync(__dirname + '/data/awful-cities-checkpoint.ipynb', "utf8")
const blob = new Blob([awfulCitiesCheckpointNotebook], {type : 'text/plain'})
console.log(blob, blob.size)
const size = blob.size

const chunk = {
  blob: blob,
  fileSizeKb: Math.round(size/1000, 10),
  chunkSize: 1000 * 1000 * 48,
  totalChunks: 1,
  chunkIndex: 0,
  filename: 'awful-cities-checkpoint.ipynb',
  uploadId: uuidv4()
}
let labbookId
describe('Add labbook file', () => {
  // test('Test Create Labbook Mutation untracked', done => {
  //   const isUntracked = true;
  //
  //   CreateLabbook.createLabbook(
  //       labbookName,
  //       isUntracked,
  //       (response, error) => {
  //         if(response){
  //           labbookId = response.createLabbook.labbook.id
  //           expect(response.createLabbook.labbook.name).toEqual(labbookName);
  //           done()
  //         }else{
  //
  //           done.fail(new Error(error))
  //         }
  //       }
  //   )
  //
  // })


  test('Test adding small file to file', done => {
    console.log(labbookId)
    AddLabbookFileMutation(
      "Code_allFiles",
      owner,
      labbookName,
      'TGFiYm9vazpjYnV0bGVyJmhlcmVoZXJl',
      'awful-cities-checkpoint.ipynb',
      chunk,
      testData.accessToken,
      "code",
        (response, error) => {
          console.log(response, error)
          if(response){

            expect(response.createLabbook.labbook.name).toEqual(labbookName);
            done()
          }else{

            done.fail(new Error(error))
          }
        }
    )

  })

  // test('Test Delete Labbook Mutation confirm', done => {
  //   const confirm = true
  //   DeleteLabbook.deleteLabbook(
  //       labbookName,
  //       confirm,
  //       (response, error) => {
  //         if(response){
  //
  //           expect(response.deleteLabbook.success).toEqual(true);
  //           done()
  //         }else{
  //
  //           done.fail(new Error(error))
  //         }
  //       }
  //   )
  // })
})

//vendor
import os from 'os'
import Blob from 'blob'
import uuidv4 from 'uuid/v4'
import fs from 'fs'
//mutations
import DeleteLabbook from './../deleteLabbook';
import CreateLabbook from './../createLabbook';
import AddLabbookFileMutation from 'Mutations/fileBrowser/AddLabbookFileMutation'
//config
import testConfig from './../config'


const owner = JSON.parse(fs.readFileSync(os.homedir() + testConfig.ownerLocation, 'utf8')).username
const labbookName = uuidv4()
const awfulCitiesCheckpointNotebook = fs.readFileSync(__dirname + '/data/awful-cities-checkpoint.ipynb', 'utf8')
const blob = new Blob([awfulCitiesCheckpointNotebook], {type : 'text/plain'})
const size = blob.size
const section = 'code'
const connectionKey = 'Code_allFiles'

//create chunk for uploading
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

describe('Test Suite: Add labbook file', () => {
  test('Test: Create Labbook Mutation ', done => {
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
  //this fails because of and issue with formdata and node-fetch
  // TODO: fix file uploads
  test('Test: AddLabbookFileMutation - Add small file to code section', done => {

    const filename = 'awful-cities-checkpoint.ipynb'

    AddLabbookFileMutation(
      connectionKey,
      owner,
      labbookName,
      labbookId,
      filename,
      chunk,
      testConfig.accessToken,
      section,
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

  test('Test: AddLabbookFileMutation - Add small file to code section: Fail section=null', done => {

    const filename = 'awful-cities-checkpoint.ipynb'

    AddLabbookFileMutation(
      connectionKey,
      owner,
      labbookName,
      labbookId,
      filename,
      chunk,
      testConfig.accessToken,
      null,
        (response, error) => {

          if(response && response.createLabbook){

            expect(response.createLabbook).toEqual(undefined);
            done.fail(new Error('Mutation should have failed'))

          }else{
            console.log(error)
            expect(error).toMatch(/Must provide query string/);
            done()

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

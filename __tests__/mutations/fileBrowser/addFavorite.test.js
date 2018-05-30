//vendor
import fs from 'fs'
import os from 'os'
import uuidv4 from 'uuid/v4'
//mutations
import DeleteLabbook from './../deleteLabbook';
import CreateLabbook from './../createLabbook';
import MakeLabbookDirectoryMutation from 'Mutations/fileBrowser/MakeLabbookDirectoryMutation'
import AddFavoriteMutation from 'Mutations/fileBrowser/AddFavoriteMutation'
//config
import testConfig from './../config'

const section = 'code'
const connectionKey = 'Code_allFiles'
const labbookName = uuidv4()

let edge
let owner = JSON.parse(fs.readFileSync(os.homedir() + testConfig.ownerLocation, "utf8")).username


let labbookId
describe('Test Suite: Add Favorite', () => {
  test('Test: CreateLabbookMuation - Create Untracked Labbook', done => {
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


  test('Test: MakeLabbookDirectoryMutation - Upload Directory', done => {

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

  test('Test: AddFavoriteMutation - Add Favorite Directory', done => {

    const directory = 'test_directory'
    const favoriteKey = 'Code_favorites'
    const description = 'this is a directory favorite'
    const isDir = true

    AddFavoriteMutation(
      favoriteKey,
      connectionKey,
      labbookId,
      owner,
      labbookName,
      directory,
      description,
      isDir,
      edge,
      section,
      (response, error) => {

          if(response){

            expect(response.addFavorite.newFavoriteEdge.node.key).toEqual(directory + '/');
            done()

          }else{
            console.log(error)
            done.fail(new Error(error))
          }
        }
    )

  })


  test('Test: AddFavoriteMutation - Add Favorite Directory: Fail: directory not added', done => {

    const directory = 'not_a_directory'
    const favoriteKey = 'Code_favorites'
    const description = 'this is a directory favorite'
    const isDir = true

    AddFavoriteMutation(
      favoriteKey,
      connectionKey,
      labbookId,
      owner,
      labbookName,
      directory,
      description,
      isDir,
      edge,
      section,
      (response, error) => {

          if(response && response.addFavorite){

            expect(response.addFavorite).toEqual(undefined);
            done.fail(new Error('Mutation should fail'))

          }else{
          
            expect(error[0].message).toMatch(/does not exist/);
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
            console.log(error)
            done.fail(new Error(error))
          }
        }
    )
  })
})

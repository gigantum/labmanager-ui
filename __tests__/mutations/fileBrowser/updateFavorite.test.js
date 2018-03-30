//vendor
import fs from 'fs'
import os from 'os'
import uuidv4 from 'uuid/v4'
//mutations
import DeleteLabbook from './../deleteLabbook';
import CreateLabbook from './../createLabbook';
import MakeLabbookDirectoryMutation from 'Mutations/fileBrowser/MakeLabbookDirectoryMutation'
import AddFavoriteMutation from 'Mutations/fileBrowser/AddFavoriteMutation'
import UpdateFavoriteMutation from 'Mutations/fileBrowser/UpdateFavoriteMutation'
//config
import testConfig from './../config'

const section = 'code'
const connectionKey = 'Code_allFiles'
const labbookName = uuidv4()

let removeFavoriteId
let edge
let favoriteEdge
let owner = JSON.parse(fs.readFileSync(os.homedir() + testConfig.ownerLocation, "utf8")).username
let labbookId

const directory = 'directory'

describe('Test Suite: Update Favorite', () => {
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

            done.fail(new Error(error))
          }
        }
    )

  })

  test('Test: AddFavoriteMutation - Add Favorite Directory', done => {

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
            favoriteEdge = response.addFavorite.newFavoriteEdge
            removeFavoriteId = response.addFavorite.newFavoriteEdge.node.id
            expect(response.addFavorite.newFavoriteEdge.node.key).toEqual(directory + '/');

            done()

          }else{
            console.log(error)
            done.fail(new Error(error))
          }
        }
    )

  })


    test('Test: UpdateFavoriteMutation - Update Favorite', done => {

      const updatedDescription = 'my favorite file'
      const key = directory + '/'
      const deleteId = edge.node.id
      const updatedIndex = 0
      const favorite = favoriteEdge

      UpdateFavoriteMutation(
        connectionKey,
        labbookId,
        owner,
        labbookName,
        deleteId,
        key,
        updatedDescription,
        updatedIndex,
        favorite,
        section,
        (response, error) => {
            console.log(response)
            if(response && response.updateFavorite){

              expect(response.updateFavorite.updatedFavoriteEdge.node.description).toMatch(updatedDescription);
              done()

            }else{
              console.log(error)
              done.fail(new Error(error))
            }
          }
      )

    })

    test('Test: UpdateFavoriteMutation - Upate favorite : Fail bad index', done => {

      const updatedDescription = 'my favorite file'
      const key = directory + '/'
      const deleteId = edge.node.id
      const updatedIndex = 3
      const favorite = favoriteEdge

      UpdateFavoriteMutation(
        connectionKey,
        labbookId,
        owner,
        labbookName,
        deleteId,
        key,
        updatedDescription,
        updatedIndex,
        favorite,
        section,
        (response, error) => {

            if(response && response.updateFavorite){

              expect(response.updateFavorite).toEqual(undefined);
              done.fail(new Error('Mutations should fail'))

            }else{
              console.log(error)
              expect(error[0].message).toMatch(/Invalid index/);
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
          if(response && response.deleteLabbook){

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

import fs from 'fs'
import DeleteLabbookMutation from 'Mutations/DeleteLabbookMutation';
import {
  testData
} from './config.js'
import os from 'os'

let owner = JSON.parse(fs.readFileSync(os.homedir() + testData.ownerLocation, "utf8")).username

const DeleteLabbook = {

    deleteLabbook: (labbbookName, confirm, callback) => {
      DeleteLabbookMutation(
      labbbookName,
      owner,
      confirm,
      callback
    )
  }
}

export default DeleteLabbook

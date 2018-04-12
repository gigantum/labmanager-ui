//vendor
import fs from 'fs'
import os from 'os'
//mutations
import DeleteLabbookMutation from 'Mutations/DeleteLabbookMutation';
import testConfig from './config'

let owner = JSON.parse(fs.readFileSync(os.homedir() + testConfig.ownerLocation, 'utf8')).username

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

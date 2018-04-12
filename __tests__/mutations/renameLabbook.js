//vendor
import fs from 'fs'
import os from 'os'
//mutations
import RenameLabbookMutation from 'Mutations/RenameLabbookMutation';
//config
import testConfig from './config'

let owner = JSON.parse(fs.readFileSync(os.homedir() + testConfig.ownerLocation, 'utf8')).username

const RenameLabbook = {
  renameLabbook: (originalLabbookName, newLabbookName, clientMutationId, callback) => {
    RenameLabbookMutation(
      owner,
      originalLabbookName,
      newLabbookName,
      callback
    )
  }
}

export default RenameLabbook;

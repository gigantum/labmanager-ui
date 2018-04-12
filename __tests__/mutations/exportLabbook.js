//vendor
import fs from 'fs'
import os from 'os'
//mutations
import ExportLabbookMutation from 'Mutations/ExportLabbookMutation';
//config
import testConfig from './config'

let owner = JSON.parse(fs.readFileSync(os.homedir() + testConfig.ownerLocation, 'utf8')).username

const ExportLabbook = {
  exportLabbook: (labbbookName, callback) => {
    ExportLabbookMutation(
      owner,
      labbbookName,
      callback
    )
  }
}

export default ExportLabbook;

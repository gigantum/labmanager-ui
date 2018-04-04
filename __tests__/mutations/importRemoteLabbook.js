//vendor
import fs from 'fs'
import os from 'os'
//mutations
import ImportRemoteLabbookMutation from 'Mutations/ImportRemoteLabbookMutation';
//config
import testConfig from './config'

let owner = JSON.parse(fs.readFileSync(os.homedir() + testConfig.ownerLocation, 'utf8')).username

const ImportRemoteLabbook = {
  importRemoteLabbook: (labbbookName, callback) => {
    ImportRemoteLabbookMutation(
      owner,
      labbbookName,
      remoteUrl,
      callback
    )
  }
}

export default ImportRemoteLabbook;

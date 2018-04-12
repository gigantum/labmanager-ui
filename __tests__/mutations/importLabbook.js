//vendor
import fs from 'fs'
import os from 'os'
//mutations
import ImportLabbookMutation from 'Mutations/ImportLabbookMutation';
//config
import testConfig from './config'

const ImportLabbook = {
  importLabbook: (callback) => {
    ImportLabbookMutation(
      blob,
      chunk,
      accessToken,
      callback
    )
  }
}

export default ImportLabbook;

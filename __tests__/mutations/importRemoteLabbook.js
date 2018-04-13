//vendor
import fs from 'fs'
import os from 'os'
//mutations
import ImportRemoteLabbookMutation from 'Mutations/ImportRemoteLabbookMutation';
//config
import testConfig from './config'



const ImportRemoteLabbook = {
  importRemoteLabbook: (callback) => {
    let {
      remoteUrl
    } = testConfig
    const labbbookName = remoteUrl.split('/')[remoteUrl.split('/').length -1];
    const owner = remoteUrl.split('/')[remoteUrl.split('/').length -2];
    remoteUrl = remoteUrl.indexOf('https://') > -1 ? remoteUrl + '.git' : 'https://' + remoteUrl + '.git'
    ImportRemoteLabbookMutation(
      owner,
      labbbookName,
      remoteUrl,
      callback
    )
  }
}

export default ImportRemoteLabbook;

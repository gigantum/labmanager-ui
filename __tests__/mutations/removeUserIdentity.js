//vendor
import fs from 'fs'
import os from 'os'
//mutations
import RemoveUserIdentityMutation from 'Mutations/RemoveUserIdentityMutation';
//config
import testConfig from './config'

let owner = JSON.parse(fs.readFileSync(os.homedir() + testConfig.ownerLocation, 'utf8')).username

const RemoveUserIdentity = {
  removeUserIdentity: (callback) => {
    RemoveUserIdentityMutation(
      callback
    )
  }
}

export default RemoveUserIdentity;

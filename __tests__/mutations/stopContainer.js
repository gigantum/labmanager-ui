//vendor
import fs from 'fs'
import os from 'os'
//mutations
import StopContainerMutation from 'Mutations/StopContainerMutation';
//config
import testConfig from './config'

let owner = JSON.parse(fs.readFileSync(os.homedir() + testConfig.ownerLocation, 'utf8')).username

const StopContainer = {
  stopContainer: (labbbookName, clientMutationId, callback) => {
    StopContainerMutation(
      labbbookName,
      owner,
      clientMutationId,
      callback
    )
  }
}

export default StopContainer;

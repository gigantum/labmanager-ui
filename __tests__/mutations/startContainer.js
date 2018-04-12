//vendor
import fs from 'fs'
import os from 'os'
//mutations
import StartContainerMutation from 'Mutations/StartContainerMutation';
//config
import testConfig from './config'

let owner = JSON.parse(fs.readFileSync(os.homedir() + testConfig.ownerLocation, 'utf8')).username

const StartContainer = {
  startContainer: (labbbookName, clientMutationId, callback) => {
    StartContainerMutation(
      labbbookName,
      owner,
      clientMutationId,
      callback
    )
  }
}

export default StartContainer;

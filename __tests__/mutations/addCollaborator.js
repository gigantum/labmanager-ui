//vendor
import fs from 'fs'
import os from 'os'
//mutations
import AddCollaboratorMutation from 'Mutations/AddCollaboratorMutation';
//config
import testConfig from './config'

let owner = JSON.parse(fs.readFileSync(os.homedir() + testConfig.ownerLocation, 'utf8')).username

const AddCollaborator = {
    addCollaborator: (labbbookName, username, callback) => {
      AddCollaboratorMutation(
      labbbookName,
      owner,
      username,
      callback
    )
  }
}

export default AddCollaborator;

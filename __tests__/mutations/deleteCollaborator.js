//vendor
import fs from 'fs'
import os from 'os'
//mutations
import DeleteCollaboratorMutation from 'Mutations/DeleteCollaboratorMutation';
//config
import testConfig from './config'

let owner = JSON.parse(fs.readFileSync(os.homedir() + testConfig.ownerLocation, 'utf8')).username

const DeleteCollaborator = {
  deleteCollaborator: (labbbookName, username, callback) => {
    DeleteCollaboratorMutation(
      labbbookName,
      owner,
      username,
      callback
    )
  }
}

export default DeleteCollaborator;

//vendor
import fs from 'fs'
import os from 'os'
//mutations
import CreateUserNoteMutation from 'Mutations/CreateUserNoteMutation';
//config
import testConfig from './config'

let owner = JSON.parse(fs.readFileSync(os.homedir() + testConfig.ownerLocation, 'utf8')).username

const CreateUserNote = {
  createUserNote: (labbbookName, callback) => {

    const {
      title,
      body,
    } = testConfig

      CreateUserNoteMutation(
      labbbookName,
      title,
      body,
      owner,
      [],
      [],
      'id',
      callback
    )
  }
}

export default CreateUserNote;


import CreateLabbookMutation from 'Mutations/createLabbookMutation';
import {
  testData
} from './config.js'


const CreateLabbook = {
    createLabbook: (labbbookName, isUntracked, callback) => {
      CreateLabbookMutation(
      labbbookName,
      testData.description,
      testData.repository,
      testData.componentId,
      testData.revision,
      isUntracked,
      callback
    )
  }
}

export default CreateLabbook

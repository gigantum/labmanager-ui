//mutations
import CreateLabbookMutation from 'Mutations/createLabbookMutation';
//config
import testConfig from './config'


const CreateLabbook = {
    createLabbook: (labbbookName, isUntracked, callback) => {

      const {
        description,
        repository,
        componentId,
        revision
      } = testConfig

      CreateLabbookMutation(
      labbbookName,
      description,
      repository,
      componentId,
      revision,
      isUntracked,
      callback
    )
  }
}

export default CreateLabbook

//mutations
import RemoveUserIdentityMutation from 'Mutations/RemoveUserIdentityMutation';
//config
import testConfig from './config'


const RemoveUserIdentity = {
  removeUserIdentity: (callback) => {
    RemoveUserIdentityMutation(
      callback
    )
  }
}

export default RemoveUserIdentity;

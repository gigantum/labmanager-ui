import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'

const mutation = graphql`
  mutation AddLabbookRemoteMutation($input: AddLabbookRemoteInput!){
    addLabbookRemote(input: $input){
      success
      clientMutationId
    }
  }
`;

let tempID = 0;

export default function AddLabbookRemoteMutation(
  owner,
  labbookName,
  remoteName,
  remoteUrl,
  labbookId,
  callback
) {


  const variables = {
    input: {
      owner,
      labbookName,
      remoteName,
      remoteUrl,
      clientMutationId: tempID++
    }
  }

  commitMutation(
    environment,
    {
      mutation,
      variables,
      onCompleted: (response, error) => {

        if(error){
          console.log(error)
        }

        callback(error)
      },
      onError: err => {console.error(err)},
      updater: (store, response) => {
      }
    },
  )
}

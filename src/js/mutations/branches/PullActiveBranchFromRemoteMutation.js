import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'
import RelayRuntime from 'relay-runtime'

const mutation = graphql`
  mutation PullActiveBranchFromRemoteMutation($input: PullActiveBranchFromRemoteInput!){
    pullActiveBranchFromRemote(input: $input){
      success
      clientMutationId
    }
  }
`;

let tempID = 0;

export default function PullActiveBranchFromRemoteMutation(
  owner,
  labbookName,
  remoteName,
  labbookId,
  callback
) {


  const variables = {
    input: {
      owner,
      labbookName,
      remoteName,
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

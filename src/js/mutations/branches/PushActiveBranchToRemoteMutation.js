import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'

const mutation = graphql`
  mutation PushActiveBranchToRemoteMutation($input: PushActiveBranchToRemoteInput!){
    pushActiveBranchToRemote(input: $input){
      success
      clientMutationId
    }
  }
`;

let tempID = 0;

export default function PushActiveBranchToRemoteMutation(
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

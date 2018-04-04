import {
  commitMutation,
  graphql,
} from 'react-relay'
import uuidV4 from 'uuid/v4'
import environment from 'JS/createRelayEnvironment'
import RelayRuntime from 'relay-runtime'

const mutation = graphql`
  mutation MergeFromBranchMutation($input: MergeFromBranchInput!){
    mergeFromBranch(input: $input){
      success
      clientMutationId
    }
  }
`;

export default function MergeFromBranchMutation(
  owner,
  labbookName,
  otherBranchName,
  force,
  callback
) {

  const clientMutationId = uuidV4()
  const variables = {
    input: {
      owner,
      labbookName,
      otherBranchName,
      force,
      clientMutationId
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

        callback(response, error)
      },
      onError: err => {console.error(err)},
      updater: (store, response) => {
      }
    },
  )
}

import {
  commitMutation,
  graphql,
} from 'react-relay'
import uuidV4 from 'uuid/v4'
import environment from 'JS/createRelayEnvironment'
import RelayRuntime from 'relay-runtime'

const mutation = graphql`
  mutation DeleteExperimentalBranchMutation($input: DeleteExperimentalBranchInput!){
    deleteExperimentalBranch(input: $input){
      success
      clientMutationId
    }
  }
`;

export default function DeleteExperimentalBranchMutation(
  owner,
  labbookName,
  branchName,
  callback
) {

  const clientMutationId = uuidV4()
  const variables = {
    input: {
      owner,
      labbookName,
      branchName,
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

import {
  commitMutation,
  graphql,
} from 'react-relay'
import uuidV4 from 'uuid/v4'
import environment from 'JS/createRelayEnvironment'
import RelayRuntime from 'relay-runtime'

const mutation = graphql`
  mutation CreateExperimentalBranchMutation($input: CreateExperimentalBranchInput!){
    createExperimentalBranch(input: $input){
      newBranchName
      clientMutationId
    }
  }
`;

export default function CreateExperimentalBranchMutation(
  owner,
  labbookName,
  branchName,
  revision,
  callback
) {

  const clientMutationId = uuidV4()
  const variables = {
    input: {
      owner,
      labbookName,
      branchName,
      revision,
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

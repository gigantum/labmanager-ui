import {
  commitMutation,
  graphql,
} from 'react-relay'
import uuidV4 from 'uuid/v4'
import environment from 'JS/createRelayEnvironment'

const mutation = graphql`
  mutation CreateExperimentalBranchMutation($input: CreateExperimentalBranchInput!, $first: Int, $cursor: String, $hasNext: Boolean!){
    createExperimentalBranch(input: $input){
      labbook{
        ...Labbook_labbook
      }
      clientMutationId
    }
  }
`;

export default function CreateExperimentalBranchMutation(
  owner,
  labbookName,
  branchName,
  revision,
  description,
  callback
) {

  const clientMutationId = uuidV4()
  const variables = {
    input: {
      owner,
      labbookName,
      branchName,
      revision,
      description,
      clientMutationId
    },
    first: 2,
    cursor: null,
    hasNext: false
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

import {
  commitMutation,
  graphql,
} from 'react-relay'
import uuidV4 from 'uuid/v4'
import environment from 'JS/createRelayEnvironment'
import RelayRuntime from 'relay-runtime'

const mutation = graphql`
  mutation CreateBranchMutation($input: CreateBranchInput!){
    createBranch(input: $input){
      branch{
        id
        owner
        name
        refName
        prefix
        commit{
          owner
          hash
          shortHash
          committedOn
          id
          committedOn
        }
      }
      clientMutationId
    }
  }
`;

export default function CreateLabbookMutation(
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

        callback(error)
      },
      onError: err => {console.error(err)},
      updater: (store, response) => {
      }
    },
  )
}

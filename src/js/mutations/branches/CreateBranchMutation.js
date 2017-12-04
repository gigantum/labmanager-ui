import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'
import RelayRuntime from 'relay-runtime'

const mutation = graphql`
  mutation CreateBranchMutation($input: CreateBranchInput!){
    createBranch(input: $input){
      branch{
        id
        name
        prefix
        commit{
          hash
          shortHash
          committedOn
          id
        }
      }
      clientMutationId
    }
  }
`;

let tempID = 0;

export default function CreateLabbookMutation(
  owner,
  labbookName,
  branchName,
  labbookId,
  callback
) {
  const variables = {
    input: {
      owner,
      labbookName,
      branchName,
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

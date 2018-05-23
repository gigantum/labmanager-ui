import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'

const mutation = graphql`
  mutation CheckoutBranchMutation($input: CheckoutBranchInput!){
    checkoutBranch(input: $input){
      labbook{
        id
        activeBranch{
          name
          id
        }
        defaultRemote
      }
      clientMutationId
    }
  }
`;

let tempID = 0;

export default function CheckoutBranchMutation(
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

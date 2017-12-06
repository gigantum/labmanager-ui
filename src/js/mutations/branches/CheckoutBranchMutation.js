import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'
import RelayRuntime from 'relay-runtime'

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

import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from '../createRelayEnvironment'
import RelayRuntime from 'relay-runtime'

const mutation = graphql`
  mutation AddEnvironmentPackageMutation($input: AddEnvironmentPackageInput!){
    addEnvironmentPackage(input: $input){
      clientMutationId
    }
  }
`;

let tempID = 0;

export default function AddEnvironmentPackageMutation(
  labbookName,
  owner,
  packageManager,
  packageName,
  clientMutationId,
  callback
) {
  const variables = {
    input: {
      labbookName,
      owner,
      packageManager,
      packageName,
      clientMutationId: tempID++
    }
  }
  commitMutation(
    environment,
    {
      mutation,
      variables,
      onCompleted: (response) => {

        callback()
      },
      onError: err => console.error(err),

      updater: (store) => {

      },
    },
  )
}

import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'
//import RelayRuntime from 'relay-runtime'

const mutation = graphql`
  mutation AddPackageComponentMutation($input: AddPackageComponentInput!){
    addPackageComponent(input: $input){
      newPackageComponentEdge{
        node{
          id
          schema
          manager
          package
          version
          latestVersion
          fromBase
        }
      }
      clientMutationId
    }
  }
`;

export default function AddPackageComponentMutation(
  labbookName,
  owner,
  repository,
  namespace,
  component,
  version,
  clientMutationId,
  environmentId,
  connection,
  componentClass,
  callback
) {
  const variables = {
    input: {
      labbookName,
      owner,
      repository,
      namespace,
      component,
      version,
      componentClass,
      clientMutationId: environmentId
    }
  }
  commitMutation(
    environment,
    {
      mutation,
      variables,
      config: [{
        type: 'RANGE_ADD',
        parentID: environmentId,
        connectionInfo: [{
          key: connection,
          rangeBehavior: 'append',
        }],
        edgeName: 'newEnvironmentEdge',
      }],
      onCompleted: (response, error) => {
        if(error){
          console.log(error)
        }
        callback(error)
      },
      onError: err => console.error(err),
      optimisticUpdater: (store) => {

      },
      updater: (store, response) => {

      }
    },
  )
}

import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'
//import RelayRuntime from 'relay-runtime'

const mutation = graphql`
  mutation AddEnvironmentComponentMutation($input: AddEnvironmentComponentInput!){
    addEnvironmentComponent(input: $input){
      environmentComponent{
        id
        repository
        namespace
        name
        version
        componentClass
      }
      clientMutationId
    }
  }
`;

export default function AddEnvironmentComponentMutation(
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

import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from '../createRelayEnvironment'
import RelayRuntime from 'relay-runtime'

const mutation = graphql`
  mutation AddEnvironmentComponentMutation($input: AddEnvironmentComponentInput!){
    addEnvironmentComponent(input: $input){
      clientMutationId
    }
  }
`;

let tempID = 0;

function sharedUpdater(store, id, newEdge, connection) {
  const environmentProxy = store.get(id);

  const conn = RelayRuntime.ConnectionHandler.getConnection(
    environmentProxy,
    connection
  );

  if(conn){
    RelayRuntime.ConnectionHandler.insertEdgeAfter(conn, newEdge);
  }

}


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
      clientMutationId,
      componentClass,
      clientMutationId: environmentId
    }
  }
  commitMutation(
    environment,
    {
      mutation,
      variables,
      // config: [{
      //   type: 'RANGE_ADD',
      //   parentID: environmentId,
      //   connectionInfo: [{
      //     key: connection,
      //     rangeBehavior: 'append',
      //   }],
      //   edgeName: 'newEnvironmentEdge',
      // }],
      onCompleted: (response, error) => {
        if(error){
          console.log(error)
        }
        callback(error)
      },
      onError: err => console.error(err)
    },
  )
}

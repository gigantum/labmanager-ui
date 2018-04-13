import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'
import RelayRuntime from 'relay-runtime'
let tempID = 0;
const mutation = graphql`
  mutation RemoveCustomComponentMutation($input: RemoveCustomComponentInput!){
    removeCustomComponent(input: $input){
      success
      clientMutationId
    }
  }
`;

function sharedUpdater(store, parentID, deletedId, connectionKey) {
  const userProxy = store.get(parentID);
  if(userProxy) {
    const conn = RelayRuntime.ConnectionHandler.getConnection(
      userProxy,
      connectionKey,
    );
    if(conn){
      RelayRuntime.ConnectionHandler.deleteNode(
        conn,
        deletedId,
      );
    }
  }
}

export default function RemoveCustomComponentMutation(
  labbookName,
  owner,
  repository,
  componentId,
  nodeID,
  clientMutationId,
  environmentId,
  connection,
  callback
) {


  const variables = {
    input: {
      labbookName,
      owner,
      repository,
      componentId,
      clientMutationId: tempID++
    }
  }
  commitMutation(
    environment,
    {
      mutation,
      variables,
      config: [{
        type: 'NODE_DELETE',
        deletedIDFieldName: nodeID,
      }],
      onCompleted: (response, error) => {
        if(error){
          console.log(error)
        }
        callback(response, error)
      },
      onError: err => console.error(err),
      updater: (store, response) => {
        sharedUpdater(store, environmentId, nodeID, connection)
      },
      optimisticUpdater: (store) => {
        sharedUpdater(store, environmentId, nodeID, connection)
      },
    },
  )
}

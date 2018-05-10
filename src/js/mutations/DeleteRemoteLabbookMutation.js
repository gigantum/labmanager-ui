import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'
import RelayRuntime from 'relay-runtime'

const mutation = graphql`
  mutation DeleteRemoteLabbookMutation($input: DeleteRemoteLabbookInput!){
    deleteRemoteLabbook(input: $input){
      success
      clientMutationId
    }
  }
`;
let tempID = 0;

function sharedUpdater(store, parentId,  deletedId, connectionKey) {
  const labbookProxy = store.get(parentId);
  if(labbookProxy) {
    const conn = RelayRuntime.ConnectionHandler.getConnection(
      labbookProxy,
      connectionKey,
    );
    if(conn){
      RelayRuntime.ConnectionHandler.deleteNode(
        conn,
        deletedId,
      );
      store.delete(deletedId)
    }

  }
}


export default function DeleteRemoteLabbookMutation(
  labbookName,
  owner,
  confirm,
  nodeID,
  parentID,
  connection,
  callback
) {
  const variables = {
    input: {
      labbookName,
      owner,
      confirm,
      clientMutationId: '' + tempID++
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

        callback(response, error)
      },
      updater: (store, response) => {
        sharedUpdater(store, parentID, nodeID, connection)
      },
    },
  )
}

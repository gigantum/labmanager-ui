import {
  commitMutation,
  graphql,
} from 'react-relay'
import RelayRuntime from 'relay-runtime'
import environment from 'JS/createRelayEnvironment'


const mutation = graphql`
  mutation DeleteLabbookFileMutation($input: DeleteLabbookFileInput!){
    deleteLabbookFile(input: $input){
      success
      clientMutationId
    }
  }
`;

let tempID = 0;

export default function DeleteLabbookFileMutation(
  connectionKey,
  user,
  owner,
  labbookName,
  labbookId,
  deleteLabbookFileId,
  filePath,
  callback
) {
  const variables = {
    input: {
      user,
      owner,
      labbookName,
      filePath,
      clientMutationId: '' + tempID++
    }
  }

  function sharedUpdater(store, labbookID, deletedID, connectionKey) {
    const userProxy = store.get(labbookID);
    const conn = RelayRuntime.ConnectionHandler.getConnection(
      userProxy,
      connectionKey,
    );
    RelayRuntime.ConnectionHandler.deleteNode(
      conn,
      deletedID,
    );
  }


  commitMutation(
    environment,
    {
      mutation,
      variables,
      configs: [{ //commented out until nodes are returned
        type: 'RANGE_DELETE',
        parentID: labbookId,
        connectionKeys: [{
          key: connectionKey,
          rangeBehavior: 'append'
        }],
        pathToConnection: ['labbook', 'files'],
        deletedIDFieldName: deleteLabbookFileId
      }],
      onCompleted: (response, error ) => {
        if(error){
          console.log(error)
        }
        callback(response, error)
      },
      onError: err => console.error(err),

      updater: (store) => {
        sharedUpdater(store, labbookId, deleteLabbookFileId, connectionKey);
      },
      optimisticUpdater: (store) => {
        sharedUpdater(store, labbookId, deleteLabbookFileId, connectionKey);
      },
    },
  )
}
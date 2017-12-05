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
  owner,
  labbookName,
  labbookId,
  deleteLabbookFileId,
  filePath,
  section,
  callback
) {

  const isDirectory = (filePath.indexOf('.') < 0)

  const variables = {
    input: {
      owner,
      labbookName,
      filePath,
      section,
      isDirectory,
      clientMutationId: '' + tempID++
    }
  }

  function sharedUpdater(store, labbookID, deletedID, connectionKey) {

    const userProxy = store.get(labbookID);
    const conn = RelayRuntime.ConnectionHandler.getConnection(
      userProxy,
      connectionKey,
    );

    console.log(conn, deletedID)
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

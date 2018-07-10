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
  edgesToDelete,
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
  let recentConnectionKey = section === 'code' ? 'MostRecentCode_allFiles' :
  section === 'input' ? 'MostRecentInput_allFiles' :
    'MostRecentOutput_allFiles'

  function sharedUpdater(store, labbookID, deletedID, connectionKey) {

    const userProxy = store.get(labbookID);

    const conn = RelayRuntime.ConnectionHandler.getConnection(
      userProxy,
      connectionKey,
    );

    if(conn){
      RelayRuntime.ConnectionHandler.deleteNode(
        conn,
        deletedID,
      );
    }
  }

  commitMutation(
    environment,
    {
      mutation,
      variables,
      configs: [{
        type: 'NODE_DELETE',
        deletedIDFieldName: deleteLabbookFileId,
        connectionKeys: [{
          key: connectionKey
        }, {
          key: recentConnectionKey
        }],
        parentId: labbookId,
        pathToConnection: ['labbook', 'allFiles']
      },],
      onCompleted: (response, error ) => {
        if(error){
          console.log(error)
        }
        callback(response, error)
      },
      onError: err => console.error(err),

      updater: (store) => {
        sharedUpdater(store, labbookId, deleteLabbookFileId, connectionKey);
        sharedUpdater(store, labbookId, deleteLabbookFileId, recentConnectionKey);

        if(Array.isArray(edgesToDelete)){
          edgesToDelete.forEach((edge) => {

            if(edge){
              sharedUpdater(store, labbookId, edge.node.id, connectionKey);
              sharedUpdater(store, labbookId, deleteLabbookFileId, recentConnectionKey);
            }
          })
        }
      },
      optimisticUpdater: (store) => {
        sharedUpdater(store, labbookId, deleteLabbookFileId, connectionKey);
        sharedUpdater(store, labbookId, deleteLabbookFileId, recentConnectionKey);
      },
    },
  )
}

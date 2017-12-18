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
        }],
        parentId: labbookId,
        pathToConnection: ['labbook', 'allFiles']
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

        edgesToDelete.map((edge)=>{
          sharedUpdater(store, labbookId, edge.node.id, connectionKey);
        })
      },
      optimisticUpdater: (store) => {
        sharedUpdater(store, labbookId, deleteLabbookFileId, connectionKey);



      },
    },
  )
}

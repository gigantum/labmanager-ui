import {
  commitMutation,
  graphql,
} from 'react-relay';
import environment from 'JS/createRelayEnvironment';
import RelayRuntime from 'relay-runtime';
import uuidv4 from 'uuid/v4';


const mutation = graphql`
  mutation RemoveFavoriteMutation($input: RemoveLabbookFavoriteInput!){
    removeFavorite(input: $input){
      success
      removedNodeId
      clientMutationId
    }
  }
`;


export default function RemoveFavoriteMutation(
  connectionKey,
  parentId,
  owner,
  labbookName,
  section,
  key,
  removeFavoriteId,
  fileItem,
  favorites,
  callback,
) {
  const clientMutationId = uuidv4();
  const variables = {
    input: {
      owner,
      labbookName,
      section,
      key,
      clientMutationId,
    },
  };

  function sharedUpdater(store, parentID, deletedId, connectionKey) {
    const labbookProxy = store.get(parentID);

    if (labbookProxy) {
      const conn = RelayRuntime.ConnectionHandler.getConnection(
        labbookProxy,
        connectionKey,
      );

      if (conn) {
        RelayRuntime.ConnectionHandler.deleteNode(
          conn,
          deletedId,
        );
      }
    }
  }
  commitMutation(
    environment,
    {
      mutation,
      variables,
      onCompleted: (response, error) => {
        if (error) {
          console.log(error);
        }
        callback(response, error);
      },
      onError: err => console.error(err),
      optimisticUpdater: (store) => {
        const id = fileItem.associatedLabbookFileId ? fileItem.associatedLabbookFileId : fileItem.node.id;

        const fileNode = store.get(id);
        if (fileNode) {
          fileNode.setValue(false, 'isFavorite');
        }
        if (fileItem.associatedLabbookFileId) {
          sharedUpdater(store, parentId, removeFavoriteId, connectionKey);
        }
      },
      updater: (store, response) => {
        const id = fileItem.associatedLabbookFileId ? fileItem.associatedLabbookFileId : fileItem.node.id;

        const fileNode = store.get(id);
        if (fileNode) {
          fileNode.setValue(false, 'isFavorite');
        }
        if (response.removeFavorite || fileItem.fileItem) {
          const removeId = fileItem.associatedLabbookFileId && fileItem.fileItem ? fileItem.fileItem.node.id : response.removeFavorite.removedNodeId;

          sharedUpdater(store, parentId, removeId, connectionKey);
        }
      },
    },
  );
}

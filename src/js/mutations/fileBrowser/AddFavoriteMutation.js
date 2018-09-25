import {
  commitMutation,
  graphql,
} from 'react-relay';
import environment from 'JS/createRelayEnvironment';
import RelayRuntime from 'relay-runtime';
import uuidv4 from 'uuid/v4';


const mutation = graphql`
  mutation AddFavoriteMutation($input: AddLabbookFavoriteInput!){
    addFavorite(input: $input){
      newFavoriteEdge{
        node{
          id
          owner
          name
          index
          key
          description
          isDir
          associatedLabbookFileId
          section
        }
        cursor
      }
      clientMutationId
    }
  }
`;


function sharedUpdater(store, parentId, connectionKey, node, tempId) {
  const labbookProxy = store.get(parentId);

  if (labbookProxy) {
    const conn = RelayRuntime.ConnectionHandler.getConnection(
      labbookProxy,
      connectionKey,
    );

    if (conn) {
      if (tempId) {
        RelayRuntime.ConnectionHandler.deleteNode(
          conn,
          tempId,
        );
      }

      const newEdge = RelayRuntime.ConnectionHandler.createEdge(
        store,
        conn,
        node,
        'newFavoriteEdge',
      );

      RelayRuntime.ConnectionHandler.insertEdgeAfter(
        conn,
        newEdge,
      );
    }
  }
}


export default function AddFavoriteMutation(
  favoriteKey,
  connectionKey,
  parentId,
  owner,
  labbookName,
  key,
  description,
  isDir,
  fileItem,
  section,
  callback,
) {
  const tempId = uuidv4();
  const clientMutationId = uuidv4();
  const variables = {
    input: {
      owner,
      labbookName,
      key,
      description,
      isDir,
      section,
      clientMutationId,
    },
  };

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
        const node = store.create(tempId, 'Favorite');

        node.setValue(tempId, 'id');
        node.setValue(false, 'isDir');
        node.setValue(key, 'key');
        node.setValue(description, 'description');

        sharedUpdater(store, parentId, favoriteKey, node);
      },

      updater: (store, response) => {
        if (response.addFavorite && response.addFavorite.newFavoriteEdge) {
          const node = store.get(response.addFavorite.newFavoriteEdge.node.id);
          node.setValue(response.addFavorite.newFavoriteEdge.node.id, 'id');
          node.setValue(false, 'isDir');
          node.setValue(response.addFavorite.newFavoriteEdge.node.key, 'key');
          node.setValue(response.addFavorite.newFavoriteEdge.node.description, 'description');
          node.setValue(response.addFavorite.newFavoriteEdge.node.index, 'index');

          sharedUpdater(store, parentId, favoriteKey, node, tempId);
        }

        const fileNode = store.get(fileItem.node.id);
        if (fileNode) {
          fileNode.setValue(true, 'isFavorite');
        }
      },
    },
  );
}

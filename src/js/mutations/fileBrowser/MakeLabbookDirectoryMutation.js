import {
  commitMutation,
  graphql,
} from 'react-relay';
import environment from 'JS/createRelayEnvironment';
import RelayRuntime from 'relay-runtime';
import uuidv4 from 'uuid/v4';

const mutation = graphql`
  mutation MakeLabbookDirectoryMutation($input: MakeLabbookDirectoryInput!){
    makeLabbookDirectory(input: $input){
      newLabbookFileEdge{
        node{
          id
          isDir
          modifiedAt
          key
          size
        }
        cursor
      }
      clientMutationId
    }
  }
`;


function sharedUpdater(store, labbookId, connectionKey, node) {
  const labbookProxy = store.get(labbookId);


  if (labbookProxy) {
    const conn = RelayRuntime.ConnectionHandler.getConnection(
      labbookProxy,
      connectionKey,
    );


    if (conn) {
      const newEdge = RelayRuntime.ConnectionHandler.createEdge(
        store,
        conn,
        node,
        'newLabbookFileEdge',
      );

      RelayRuntime.ConnectionHandler.insertEdgeAfter(
        conn,
        newEdge,
      );
    }
  }
}

function deleteOptimisticEdge(store, labbookID, deletedID, connectionKey) {
  const labbookProxy = store.get(labbookID);

  if (labbookProxy) {
    const conn = RelayRuntime.ConnectionHandler.getConnection(
      labbookProxy,
      connectionKey,
    );

    if (conn) {
      RelayRuntime.ConnectionHandler.deleteNode(
        conn,
        deletedID,
      );
    }
  }
}

let tempID = 0;


export default function MakeLabbookDirectoryMutation(
  connectionKey,
  owner,
  labbookName,
  labbookId,
  directory,
  section,
  callback,
) {
  const variables = {
    input: {
      owner,
      labbookName,
      directory,
      section,
      clientMutationId: `${tempID++}`,
    },
  };

  const optimisticId = uuidv4();
  commitMutation(
    environment,
    {
      mutation,
      variables,
      configs: [{ // commented out until nodes are returned
        type: 'RANGE_ADD',
        parentID: labbookId,
        connectionInfo: [{
          key: connectionKey,
          rangeBehavior: 'prepend',
        }],
        edgeName: 'newLabbookFileEdge',
      }],
      onCompleted: (response, error) => {
        if (error) {
          console.log(error);
        }
        callback(response, error);
      },
      onError: err => callback({}, err),
      optimisticUpdater: (store) => {
        const node = store.create(optimisticId, 'CodeFile');

        node.setValue(optimisticId, 'id');
        node.setValue(false, 'isDir');
        node.setValue(directory, 'key');
        node.setValue(0, 'modifiedAt');
        node.setValue(100, 'size');

        sharedUpdater(store, labbookId, connectionKey, node);

        deleteOptimisticEdge(store, labbookId, optimisticId, connectionKey);
      },
      updater: (store, response) => {
        const id = `client:newCodeFile:${tempID++}`;
        const node = store.create(id, 'CodeFile');

        // deleteOptimisticEdge(store, labbookId, tempNodeId, connectionKey)

        if (response.makeLabbookDirectory && response.makeLabbookDirectory.newLabbookFileEdge) {
          node.setValue(response.makeLabbookDirectory.newLabbookFileEdge.node.id, 'id');
          node.setValue(false, 'isDir');
          node.setValue(response.makeLabbookDirectory.newLabbookFileEdge.node.key, 'key');
          node.setValue(response.makeLabbookDirectory.newLabbookFileEdge.node.modifiedAt, 'modifiedAt');
          node.setValue(response.makeLabbookDirectory.newLabbookFileEdge.node.size, 'size');

          // sharedUpdater(store, labbookId, connectionKey, node)
        }
      },
    },
  );
}

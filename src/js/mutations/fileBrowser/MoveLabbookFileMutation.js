import {
  commitMutation,
  graphql,
} from 'react-relay';
import RelayRuntime from 'relay-runtime';
import environment from 'JS/createRelayEnvironment';

import { setErrorMessage } from 'JS/redux/reducers/footer';

const mutation = graphql`
  mutation MoveLabbookFileMutation($input: MoveLabbookFileInput!){
    moveLabbookFile(input: $input){
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

let tempID = 0;

function sharedDeleteUpdater(store, labbookID, deletedID, connectionKey) {
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


export default function MoveLabbookFileMutation(
  connectionKey,
  owner,
  labbookName,
  labbookId,
  edge,
  srcPath,
  dstPath,
  section,
  callback,
) {
  const variables = {
    input: {
      owner,
      labbookName,
      srcPath,
      dstPath,
      section,
      clientMutationId: `${tempID++}`,
    },
  };
  const recentConnectionKey = section === 'code' ? 'MostRecentCode_allFiles' :
    section === 'input' ? 'MostRecentInput_allFiles' :
      'MostRecentOutput_allFiles';
  commitMutation(
    environment,
    {
      mutation,
      variables,
      configs: [{
        type: 'RANGE_ADD',
        parentID: labbookId,
        connectionInfo: [{
          key: connectionKey,
          rangeBehavior: 'prepend',
        }],
        edgeName: 'newLabbookFileEdge',
      }, {
        type: 'RANGE_ADD',
        parentID: labbookId,
        connectionInfo: [{
          key: recentConnectionKey,
          rangeBehavior: 'prepend',
        }],
        edgeName: 'newLabbookFileEdge',
      }],
      onCompleted: (response, error) => {
        if (error) {
          console.log(error);
          setErrorMessage(`ERROR: Could not Move labbook file ${srcPath}`, error);
        }
        callback(response, error);
      },
      onError: err => console.error(err),
      optimisticUpdater: (store) => {
        const id = `client:newFileMove:${tempID++}`;
        const labbookProxy = store.get(labbookId);

        if (labbookProxy) {
          const conn = RelayRuntime.ConnectionHandler.getConnection(
            labbookProxy,
            connectionKey,
          );

          const node = store.create(id, 'MoveFile');

          if (conn) {
            const newEdge = RelayRuntime.ConnectionHandler.createEdge(
              store,
              conn,
              node,
              'newLabbookFileEdge',
            );

            node.setValue(id, 'id');
            node.setValue(false, 'isDir');
            node.setValue(dstPath, 'key');
            node.setValue(0, 'modifiedAt');
            node.setValue(100, 'size');


            RelayRuntime.ConnectionHandler.insertEdgeAfter(
              conn,
              newEdge,
            );
          }
        }
      },
      updater: (store, response) => {
        sharedDeleteUpdater(store, labbookId, edge.node.id, connectionKey);
        sharedDeleteUpdater(store, labbookId, edge.node.id, recentConnectionKey);
      },

    },
  );
}

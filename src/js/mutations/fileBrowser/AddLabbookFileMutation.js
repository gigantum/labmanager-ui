import {
  commitMutation,
  graphql,
} from 'react-relay';
import environment from 'JS/createRelayEnvironment';
import RelayRuntime from 'relay-runtime';
import uuidv4 from 'uuid/v4';


const mutation = graphql`
  mutation AddLabbookFileMutation($input: AddLabbookFileInput!){
    addLabbookFile(input: $input){
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


function deleteEdge(store, labbookID, deletedID, connectionKey) {
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

export default function AddLabbookFileMutation(
  connectionKey,
  owner,
  labbookName,
  labbookId,
  filePath,
  chunk,
  accessToken,
  section,
  transactionId,
  callback,
) {
  const uploadables = [chunk.blob, accessToken];

  const id = uuidv4();
  const optimisticId = uuidv4();

  const variables = {
    input: {
      owner,
      labbookName,
      filePath,
      chunkUploadParams: {
        fileSizeKb: chunk.fileSizeKb,
        chunkSize: chunk.chunkSize,
        totalChunks: chunk.totalChunks,
        chunkIndex: chunk.chunkIndex,
        filename: chunk.filename,
        uploadId: chunk.uploadId,
      },
      section,
      transactionId,
      clientMutationId: id,
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
      uploadables,
      configs: [{ // commented out until nodes are returned
        type: 'RANGE_ADD',
        parentID: labbookId,
        connectionInfo: [{
          key: connectionKey,
          rangeBehavior: 'append',
        }],
        edgeName: 'newLabbookFileEdge',
      }, {
        type: 'RANGE_ADD',
        parentID: labbookId,
        connectionInfo: [{
          key: recentConnectionKey,
          rangeBehavior: 'append',
        }],
        edgeName: 'newLabbookFileEdge',
      }],
      onCompleted: (response, error) => {
        if (error) {
          console.log(error);
        }
        callback(response, error);
      },
      onError: err => console.error(err),
      optimisticUpdater: (store) => {
        const node = store.create(optimisticId, 'LabbookFile');

        node.setValue(optimisticId, 'id');
        node.setValue(false, 'isDir');
        node.setValue(filePath, 'key');
        node.setValue(0, 'modifiedAt');
        node.setValue(chunk.chunkSize, 'size');

        sharedUpdater(store, labbookId, connectionKey, node);
        sharedUpdater(store, labbookId, recentConnectionKey, node);
      },
      updater: (store, response) => {
        deleteEdge(store, labbookId, optimisticId, connectionKey);
        deleteEdge(store, labbookId, optimisticId, recentConnectionKey);

        if (response.addLabbookFile && response.addLabbookFile.newLabbookFileEdge && response.addLabbookFile.newLabbookFileEdge.node) {
          const { id } = response.addLabbookFile.newLabbookFileEdge.node;

          const nodeExists = store.get(id);

          const responseKey = response.addLabbookFile.newLabbookFileEdge.node.key;
          const responseKeyArr = responseKey.split('/');
          let temp = '';

          responseKeyArr.forEach((key, index) => {
            if (!nodeExists || index !== responseKeyArr.length - 1) {
              let node;

              if (index === responseKeyArr.length - 1) {
                temp += key;
              } else {
                temp = `${temp + key}/`;
              }

              if (index === responseKeyArr.length - 1) {
                node = store.create(id, 'LabbookFile');
                node.setValue(response.addLabbookFile.newLabbookFileEdge.node.size, 'size');
                node.setValue(false, 'isDir');
                node.setValue(response.addLabbookFile.newLabbookFileEdge.node.id, 'id');
                node.setValue(response.addLabbookFile.newLabbookFileEdge.node.key, 'key');
                node.setValue(response.addLabbookFile.newLabbookFileEdge.node.modifiedAt, 'modifiedAt');
                sharedUpdater(store, labbookId, connectionKey, node);
                sharedUpdater(store, labbookId, recentConnectionKey, node);
              } else if (!store.get(temp)) {
                node = store.create(temp, 'LabbookFile');
                node.setValue(temp, 'id');
                node.setValue(true, 'isDir');
                node.setValue(temp, 'key');
                node.setValue(0, 'size');
                node.setValue(response.addLabbookFile.newLabbookFileEdge.node.modifiedAt, 'modifiedAt');
                sharedUpdater(store, labbookId, connectionKey, node);
                sharedUpdater(store, labbookId, recentConnectionKey, node);
              }
            }
          });
        }
      },
    },
  );
}

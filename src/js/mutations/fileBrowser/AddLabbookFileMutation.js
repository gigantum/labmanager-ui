import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'
import RelayRuntime from 'relay-runtime'
import uuidv4 from 'uuid/v4'


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

  const conn = RelayRuntime.ConnectionHandler.getConnection(
    labbookProxy,
    connectionKey
  );
  console.log(conn)
  if(conn){
    const newEdge = RelayRuntime.ConnectionHandler.createEdge(
      store,
      conn,
      node,
      "newLabbookFileEdge"
    )

    RelayRuntime.ConnectionHandler.insertEdgeAfter(
      conn,
      newEdge
    );
  }
}


  function deleteEdge(store, labbookID, deletedID, connectionKey) {

    const userProxy = store.get(labbookID);

    console.log(userProxy)
    const conn = RelayRuntime.ConnectionHandler.getConnection(
      userProxy,
      connectionKey,
    );
    console.log(conn)
    if(conn){
      RelayRuntime.ConnectionHandler.deleteNode(
        conn,
        deletedID,
      );
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
  callback
) {

  let uploadables = [chunk.blob, accessToken]
  const id = uuidv4()
  const optimisticId = uuidv4()
  const variables = {
    input: {
      owner,
      labbookName,
      filePath,
      chunkUploadParams:{
        fileSizeKb: chunk.fileSizeKb,
        chunkSize: chunk.chunkSize,
        totalChunks: chunk.totalChunks,
        chunkIndex: chunk.chunkIndex,
        filename: chunk.filename,
        uploadId: chunk.uploadId,
      },
      section,
      clientMutationId: id
    }
  }

  commitMutation(
    environment,
    {
      mutation,
      variables,
      uploadables,
      configs: [{ //commented out until nodes are returned
        type: 'RANGE_ADD',
        parentID: labbookId,
        connectionInfo: [{
          key: connectionKey,
          rangeBehavior: 'append'
        }],
        edgeName: 'newLabbookFileEdge'
      }],
      onCompleted: (response, error ) => {
        if(error){
          console.log(error)
        }
        callback(response, error)
      },
      onError: err => console.error(err),
      optimisticUpdater:(store)=>{

        const node = store.create(optimisticId, 'LabbookFile')

        node.setValue(optimisticId, "id")
        node.setValue(false, 'isDir')
        node.setValue(filePath, 'key')
        node.setValue(0, 'modifiedAt')
        node.setValue(chunk.chunkSize, 'size')

        sharedUpdater(store, labbookId, connectionKey, node)

      },
      updater: (store, response) => {
        deleteEdge(store, labbookId, optimisticId, connectionKey)
        const id = uuidv4()
        const node = store.create(id, 'LabbookFile')

        if(response.addLabbookFile && response.addLabbookFile.newLabbookFileEdge){
          node.setValue(response.addLabbookFile.newLabbookFileEdge.node.id, "id")
          node.setValue(false, 'isDir')
          node.setValue(response.addLabbookFile.newLabbookFileEdge.node.key, 'key')
          node.setValue(response.addLabbookFile.newLabbookFileEdge.node.modifiedAt, 'modifiedAt')
          node.setValue(response.addLabbookFile.newLabbookFileEdge.node.size, 'size')

          //sharedUpdater(store, labbookId, connectionKey, node)
        }

      },
    },
  )
}

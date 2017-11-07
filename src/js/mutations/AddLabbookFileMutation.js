import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'
import RelayRuntime from 'relay-runtime'


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

  console.log(conn, node)
  if(conn){
    const newEdge = RelayRuntime.ConnectionHandler.createEdge(
      store,
      conn,
      node,
      "newLabbookFileEdge"
    )

    console.log(newEdge)
    RelayRuntime.ConnectionHandler.insertEdgeAfter(
      conn,
      newEdge
    );
  }
}

let tempID = 0;

export default function AddLabbookFileMutation(
  connectionKey,
  user,
  owner,
  labbookName,
  labbookId,
  filePath,
  chunk,
  accessToken,
  callback
) {
  let uploadables = [chunk.blob, accessToken]
  console.log(connectionKey,
  user,
  owner,
  labbookName,
  labbookId,
  filePath,
  chunk,
  accessToken)
  const variables = {
    input: {
      user,
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
      clientMutationId: '' + tempID++
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
          rangeBehavior: 'append',
          filters: {baseDir: 'code', first: 2}
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

      updater: (store, response) => {
        const id = 'client:newCodeFile:'+ tempID++;
        const node = store.create(id, 'CodeFile')
        if(response.addLabbookFile.newLabbookFileEdge){
          node.setValue(response.addLabbookFile.newLabbookFileEdge.node.id, "id")
          node.setValue(false, 'isDir')
          node.setValue(response.addLabbookFile.newLabbookFileEdge.node.key, 'key')
          node.setValue(response.addLabbookFile.newLabbookFileEdge.node.modifiedAt, 'modifiedAt')
          node.setValue(response.addLabbookFile.newLabbookFileEdge.node.size, 'size')


          console.log(store, response)
          sharedUpdater(store, labbookId, connectionKey, node)
        }

      },
    },
  )
}

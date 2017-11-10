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
      optimisticUpdater:(store)=>{
        const id = 'client:newCodeFile:'+ tempID++;
        const node = store.create(id, 'CodeFile')
        console.log(filePath)
        node.setValue(id, "id")
        node.setValue(false, 'isDir')
        node.setValue('code/' + chunk.filename, 'key')
        node.setValue(0, 'modifiedAt')
        node.setValue(chunk.chunkSize, 'size')

        sharedUpdater(store, labbookId, connectionKey, node)

      },
      updater: (store, response) => {
        const id = 'client:newCodeFile:'+ tempID++;
        const node = store.create(id, 'CodeFile')
        if(response.addLabbookFile.newLabbookFileEdge){
          node.setValue(response.addLabbookFile.newLabbookFileEdge.node.id, "id")
          node.setValue(false, 'isDir')
          node.setValue(response.addLabbookFile.newLabbookFileEdge.node.key, 'key')
          node.setValue(response.addLabbookFile.newLabbookFileEdge.node.modifiedAt, 'modifiedAt')
          node.setValue(response.addLabbookFile.newLabbookFileEdge.node.size, 'size')

          sharedUpdater(store, labbookId, connectionKey, node)
        }

      },
    },
  )
}

import {
  commitMutation,
  graphql,
} from 'react-relay'
import RelayRuntime from 'relay-runtime'
import environment from 'JS/createRelayEnvironment'


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

function sharedUpdater(store, labbookID, deletedID, connectionKey) {
  const userProxy = store.get(labbookID);
  const conn = RelayRuntime.ConnectionHandler.getConnection(
    userProxy,
    connectionKey,
  );

  RelayRuntime.ConnectionHandler.deleteNode(
    conn,
    deletedID
  );
}


export default function MoveLabbookFileMutation(
  connectionKey,
  user,
  owner,
  labbookName,
  labbookId,
  edge,
  srcPath,
  dstPath,
  section,
  callback
) {

  const variables = {
    input: {
      owner,
      labbookName,
      srcPath,
      dstPath,
      section,
      clientMutationId: '' + tempID++
    }
  }

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
          rangeBehavior: 'prepend'
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
      optimisticUpdater: (store) => {

        sharedUpdater(store, labbookId, edge.node.id, connectionKey);
        const id = 'client:newFileMove:'+ tempID++;
        const userProxy = store.get(labbookId);

        const conn = RelayRuntime.ConnectionHandler.getConnection(
          userProxy,
          connectionKey,
        );

        const node = store.create(id, 'MoveFile')

        if(conn){

          const newEdge = RelayRuntime.ConnectionHandler.createEdge(
            store,
            conn,
            node,
            "newLabbookFileEdge"
          )

          node.setValue(id, "id")
          node.setValue(false, 'isDir')
          node.setValue(dstPath, 'key')
          node.setValue(0, 'modifiedAt')
          node.setValue(100, 'size')

    
          RelayRuntime.ConnectionHandler.insertEdgeAfter(
            conn,
            newEdge
          );
        }
      },
      updater: (store) => {
        sharedUpdater(store, labbookId, edge.node.id, connectionKey);
      }

    },
  )
}

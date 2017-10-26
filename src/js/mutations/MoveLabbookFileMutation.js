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
  callback
) {

  const variables = {
    input: {
      user,
      owner,
      labbookName,
      srcPath,
      dstPath,
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

      updater: (store) => {
        sharedUpdater(store, labbookId, edge.node.id, connectionKey);
      },
      optimisticUpdater: (store) => {
        sharedUpdater(store, labbookId, edge.node.id, connectionKey);
      }
    },
  )
}

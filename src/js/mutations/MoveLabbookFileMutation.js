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

function sharedUpdater(store, labbookID, deletedID) {
  const userProxy = store.get(labbookID);
  const conn = RelayRuntime.ConnectionHandler.getConnection(
    userProxy,
    'Code_files',
  );

  RelayRuntime.ConnectionHandler.deleteNode(
    conn,
    deletedID,
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
      configs: [{ //commented out until nodes are returned
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
        sharedUpdater(store, labbookId, edge.node.id);
      },
      optimisticUpdater: (store) => {
        sharedUpdater(store, labbookId, edge.node.id);
      },
      optimisticResponse:  {
        moveLabbookFile: {
          newLabbookFileEdge:{
            node:{
              id: edge.node.id,
              isDir: edge.node.isDir,
              modifiedAt: edge.node.modifiedAt,
              key: dstPath,
              size: edge.node.size
            }
          }
        }
      }
    },
  )
}

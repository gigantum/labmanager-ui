import {
  commitMutation,
  graphql,
} from 'react-relay'
import RelayRuntime from 'relay-runtime'
import environment from 'JS/createRelayEnvironment'


const mutation = graphql`
  mutation RenameLabbookMutation($input: RenameLabbookInput!){
    renameLabbook(input: $input){
      success
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


export default function RenameLabbookMutation(
  owner,
  originalLabbookName,
  newLabbookName,
  callback
) {

  const variables = {
    input: {
      owner,
      originalLabbookName,
      newLabbookName,
      clientMutationId: '' + tempID++
    }
  }
  console.log(owner, originalLabbookName, newLabbookName, callback)
  commitMutation(
    environment,
    {
      mutation,
      variables,
      onCompleted: (response, error ) => {

        if(error){
          console.log(error)
        }
        callback(response, error)
      },
      onError: err => console.error(err),
      updater: (store) => {
        //sharedUpdater(store, labbookId, edge.node.id, connectionKey);
      },
      optimisticUpdater: (store) => {
        //sharedUpdater(store, labbookId, edge.node.id, connectionKey);
      }
    },
  )
}

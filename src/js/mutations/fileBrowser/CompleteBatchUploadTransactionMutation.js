import {
  commitMutation,
  graphql,
} from 'react-relay';
import environment from 'JS/createRelayEnvironment';
import uuidv4 from 'uuid/v4';


const mutation = graphql`
  mutation CompleteBatchUploadTransactionMutation($input: CompleteBatchUploadTransactionInput!){
    completeBatchUploadTransaction(input: $input){
      clientMutationId
    }
  }
`;

// commented until fully implimented
// function sharedUpdater(store, labbookId, connectionKey, node) {

//   const labbookProxy = store.get(labbookId);
//   if(labbookProxy){
//     const conn = RelayRuntime.ConnectionHandler.getConnection(
//       labbookProxy,
//       connectionKey
//     );

//     if(conn){
//       const newEdge = RelayRuntime.ConnectionHandler.createEdge(
//         store,
//         conn,
//         node,
//         "newLabbookFileEdge"
//       )

//       RelayRuntime.ConnectionHandler.insertEdgeAfter(
//         conn,
//         newEdge
//       );
//     }
//   }
// }


//   function deleteEdge(store, labbookID, deletedID, connectionKey) {

//     const labbookProxy = store.get(labbookID);
//     if(labbookProxy){

//       const conn = RelayRuntime.ConnectionHandler.getConnection(
//         labbookProxy,
//         connectionKey,
//       );

//       if(conn){
//         RelayRuntime.ConnectionHandler.deleteNode(
//           conn,
//           deletedID,
//         );
//       }
//     }
//   }

export default function AddLabbookFileMutation(
  connectionKey,
  owner,
  labbookName,
  cancel,
  rollback,
  transactionId,
  callback,
) {
  const id = uuidv4();

  const variables = {
    input: {
      owner,
      labbookName,
      cancel,
      rollback,
      transactionId,
      clientMutationId: id,
    },
  };


  commitMutation(
    environment,
    {
      mutation,
      variables,
      onCompleted: (response, error) => {
        if (error) {
          console.log(error);
        }
        callback(response, error);
      },
      onError: err => console.error(err),
      optimisticUpdater: (store) => {

      },
      updater: (store, response) => {

      },
    },
  );
}

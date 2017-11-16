import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'
import RelayRuntime from 'relay-runtime'
import uuidv4 from 'uuid/v4'


const mutation = graphql`
  mutation RemoveFavoriteMutation($input: RemoveLabbookFavoriteInput!){
    removeFavorite(input: $input){
      success
      clientMutationId
    }
  }
`;


export default function RemoveFavoriteMutation(
  connectionKey,
  parentId,
  owner,
  labbookName,
  subdir,
  index,
  removeFavoriteId,
  callback
) {
  const clientMutationId = uuidv4()
  const variables = {
    input: {
      owner,
      labbookName,
      subdir,
      index,
      clientMutationId
    }
  }

  console.log(variables)
  function sharedUpdater(store, parentID, deletedID, connectionKey) {
    const userProxy = store.get(parentID);
    const conn = RelayRuntime.ConnectionHandler.getConnection(
      userProxy,
      connectionKey,
    );
    RelayRuntime.ConnectionHandler.deleteNode(
      conn,
      deletedID,
    );
  }
  commitMutation(
    environment,
    {
      mutation,
      variables,
      // configs: [{ //commented out until nodes are returned
      //   type: 'RANGE_ADD',
      //   parentID: labbookId,
      //   connectionInfo: [{
      //     key: connectionKey,
      //     rangeBehavior: 'append',
      //     filters: {baseDir: 'code', first: 2}
      //   }],
      //   edgeName: 'newLabbookFileEdge'
      // }],
      onCompleted: (response, error ) => {
        if(error){
          console.log(error)
        }
        callback(response, error)
      },
      onError: err => console.error(err),
      optimisticUpdater:(store)=>{


        sharedUpdater(store, parentId, removeFavoriteId, connectionKey)

      },
      updater: (store, response) => {

        sharedUpdater(store, parentId, removeFavoriteId, connectionKey)


      }
    },
  )
}

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
  section,
  key,
  removeFavoriteId,
  callback
) {

  const clientMutationId = uuidv4()
  const variables = {
    input: {
      owner,
      labbookName,
      section,
      key,
      clientMutationId
    }
  }

  function sharedUpdater(store, parentID, deletedId, connectionKey) {
    const userProxy = store.get(parentID);

    const conn = RelayRuntime.ConnectionHandler.getConnection(
      userProxy,
      connectionKey,
    );
    if(conn){
      RelayRuntime.ConnectionHandler.deleteNode(
        conn,
        deletedId,
      );
    }
  }
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
      optimisticUpdater:(store)=>{

        sharedUpdater(store, parentId, removeFavoriteId, connectionKey)

      },
      updater: (store, response) => {

        sharedUpdater(store, parentId, removeFavoriteId, connectionKey)

      }
    },
  )
}

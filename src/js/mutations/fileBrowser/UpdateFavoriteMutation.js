import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'
import RelayRuntime from 'relay-runtime'
import uuidv4 from 'uuid/v4'


const mutation = graphql`
  mutation UpdateFavoriteMutation($input: UpdateLabbookFavoriteInput!){
    updateFavorite(input: $input){
      updatedFavoriteEdge{
        node{
          id
          index
          key
          description
          isDir
        }
        cursor
      }
      clientMutationId
    }
  }
`;


function sharedUpdater(store, parentId, connectionKey, node, deleteId) {

  const labbookProxy = store.get(parentId);

  const conn = RelayRuntime.ConnectionHandler.getConnection(
    labbookProxy,
    connectionKey
  );

  if(conn){

    const newEdge = RelayRuntime.ConnectionHandler.createEdge(
      store,
      conn,
      node,
      "newFavoriteEdge"
    )

    RelayRuntime.ConnectionHandler.insertEdgeAfter(
      conn,
      newEdge
    );

  }
}

export default function UpdateFavoriteMutation(
  connectionKey,
  parentId,
  owner,
  labbookName,
  deleteId,
  key,
  updatedDescription,
  updatedIndex,
  favorite,
  section,
  callback
) {

  const clientMutationId = uuidv4()

  const variables = {
    input: {
      owner,
      key,
      labbookName,
      updatedDescription,
      updatedIndex,
      section,
      clientMutationId
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

        const node = store.get(favorite.id)

        node.setValue(updatedDescription, 'description')
        node.setValue(updatedIndex, 'index')

      },

      updater: (store, response)=>{

        const node = store.get(favorite.id)

        node.setValue(updatedDescription, 'description')
        node.setValue(updatedIndex, 'index')
      }

    },
  )
}

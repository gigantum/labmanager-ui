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


function sharedUpdater(store, parentId, connectionKey, node) {

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
  updatedKey,
  updatedDescription,
  index,
  updatedIndex,
  section,
  callback
) {

  const clientMutationId = uuidv4()
  const variables = {
    input: {
      owner,
      labbookName,
      updatedKey,
      updatedDescription,
      index,
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

        const id = uuidv4()
        const node = store.create(id, 'Favorite')

        node.setValue(id, "id")
        node.setValue(false, 'isDir')
        node.setValue(updatedKey, 'key')
        node.setValue(updatedDescription, 'description')

        sharedUpdater(store, parentId, connectionKey, node)

      },
      updater: (store, response) => {
        console.log(store, response)
        const id = uuidv4()
        const node = store.create(id, 'Favorite')

        if(response.updatedFavorite && response.addFavorite.updatedFavoriteEdge){
          node.setValue(response.updatedFavorite.updatedFavoriteEdge.node.id, "id")
          node.setValue(false, 'isDir')
          node.setValue(response.updatedFavorite.updatedFavoriteEdge.node.key, 'key')
          node.setValue(response.updatedFavorite.updatedFavoriteEdge.node.description, 'description')
          node.setValue(response.updatedFavorite.updatedFavoriteEdge.node.index, 'index')

          sharedUpdater(store, parentId, connectionKey, node)
        }

      }
    },
  )
}

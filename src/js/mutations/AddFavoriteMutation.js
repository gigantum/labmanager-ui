import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'
import RelayRuntime from 'relay-runtime'
import uuidv4 from 'uuid/v4'


const mutation = graphql`
  mutation AddFavoriteMutation($input: AddLabbookFavoriteInput!){
    addFavorite(input: $input){
      newFavoriteEdge{
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


export default function AddFavoriteMutation(
  connectionKey,
  parentId,
  owner,
  labbookName,
  subdir,
  key,
  description,
  isDir,
  index,
  callback
) {
  const clientMutationId = uuidv4()
  const variables = {
    input: {
      owner,
      labbookName,
      subdir,
      key,
      description,
      isDir,
      index,
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
        node.setValue(subdir + key, 'key')
        node.setValue(description, 'description')

        sharedUpdater(store, parentId, connectionKey, node)

      },
      updater: (store, response) => {

        const id = uuidv4()
        const node = store.create(id, 'Favorite')

        if(response.addFavorite && response.addFavorite.newFavoriteEdge){
          node.setValue(response.addFavorite.newFavoriteEdge.node.id, "id")
          node.setValue(false, 'isDir')
          node.setValue(response.addFavorite.newFavoriteEdge.node.key, 'key')
          node.setValue(response.addFavorite.newFavoriteEdge.node.description, 'description')
          node.setValue(response.addFavorite.newFavoriteEdge.node.index, 'index')
      
          sharedUpdater(store, parentId, connectionKey, node)
        }

      }
    },
  )
}

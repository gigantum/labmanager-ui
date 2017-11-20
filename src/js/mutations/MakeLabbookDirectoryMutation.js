import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'
import RelayRuntime from 'relay-runtime'

const mutation = graphql`
  mutation MakeLabbookDirectoryMutation($input: MakeLabbookDirectoryInput!){
    makeLabbookDirectory(input: $input){
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


function sharedUpdater(store, labbookId, connectionKey, node) {
  const labbookProxy = store.get(labbookId);

  const conn = RelayRuntime.ConnectionHandler.getConnection(
    labbookProxy,
    connectionKey
  );

  if(conn){
    const newEdge = RelayRuntime.ConnectionHandler.createEdge(
      store,
      conn,
      node,
      "newLabbookFileEdge"
    )

    RelayRuntime.ConnectionHandler.insertEdgeAfter(
      conn,
      newEdge
    );
  }
}

let tempID = 0;

export default function MakeLabbookDirectoryMutation(
  connectionKey,
  user,
  owner,
  labbookName,
  labbookId,
  directory,
  section,
  callback
) {
  const variables = {
    input: {
      owner,
      labbookName,
      directory,
      section,
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
      optimisticUpdater: (store)=>{
        const id = 'client:newCodeFile:'+ tempID++;
        const node = store.create(id, 'CodeFile')


        node.setValue(id, "id")
        node.setValue(false, 'isDir')
        node.setValue(directory, 'key')
        node.setValue(0, 'modifiedAt')
        node.setValue(100, 'size')

        sharedUpdater(store, labbookId, connectionKey, node)

      },
      updater: (store, response) => {
        const id = 'client:newCodeFile:'+ tempID++;
        const node = store.create(id, 'CodeFile')

        if(response.makeLabbookDirectory && response.makeLabbookDirectory.newLabbookFileEdge){
          node.setValue(response.makeLabbookDirectory.newLabbookFileEdge.node.id, "id")
          node.setValue(false, 'isDir')
          node.setValue(response.makeLabbookDirectory.newLabbookFileEdge.node.key, 'key')
          node.setValue(response.makeLabbookDirectory.newLabbookFileEdge.node.modifiedAt, 'modifiedAt')
          node.setValue(response.makeLabbookDirectory.newLabbookFileEdge.node.size, 'size')

          sharedUpdater(store, labbookId, connectionKey, node)
        }


      },
    },
  )
}

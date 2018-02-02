import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'
import RelayRuntime from 'relay-runtime'

const mutation = graphql`
  mutation AddCustomComponentMutation($input: AddCustomComponentInput!){
    addCustomComponent(input: $input){
      clientMutationId
    }
  }
`;

let tempID = 0;


/**
  @param {object, string, object} store,id,newEdge
  gets a connection to the store and insets an edge if connection is Successful
*/
function sharedUpdater(store, id, newEdge) {
  const userProxy = store.get(id);
  const conn = RelayRuntime.ConnectionHandler.getConnection(
    userProxy,
    'PackageManagerDependencies_packageDependencies'
  );
  console.log(store, id, newEdge);
  console.log(conn)
  if(conn){
    RelayRuntime.ConnectionHandler.insertEdgeAfter(conn, newEdge);
  }

}


export default function AddEnvironmentPackageMutation(
  labbookName,
  owner,
  manager,
  packageName,
  clientMutationId,
  callback
) {
  const variables = {
    input: {
      labbookName,
      owner,
      manager,
      packageName,
      clientMutationId:  tempID++
    }
  }
  commitMutation(
    environment,
    {
      mutation,
      variables,
      onCompleted: (response, error) => {
        if(error){
          console.log(error)
        }
        callback(error)
      },
      onError: err => console.error(err),

      updater: (store) => {
        console.log(store)
        if(clientMutationId){
          //TODO use edge from linked record
          const id = 'client:PackageManagerDependencies:' + tempID++;
          const node = store.create(id, 'package');
          node.setValue(manager, 'manager')
          node.setValue(packageName, 'packageName')
          node.setValue(labbookName, 'labbookName')
          node.setValue(owner, 'owner')
          console.log(node)
          const newEdge = store.create(
            'client:newEdge:' + tempID,
            'PackageManagerEdge',
          );

          newEdge.setLinkedRecord(node, 'node');

          sharedUpdater(store, clientMutationId, newEdge);
        }
      },
      optimisticUpdater: (store) => {
        console.log(store)
        if(clientMutationId){

          const id = 'client:newPackageManager:' + tempID++;
          const node = store.create(id, 'PackageManager');

          node.setValue(manager, 'manager')
          node.setValue(packageName, 'packageName')
          node.setValue(labbookName, 'labbookName')
          node.setValue(owner, 'owner')
          const newEdge = store.create(
            'client:newEdge:' + tempID,
            'PackageManagerEdge',
          );

          newEdge.setLinkedRecord(node, 'node');

          sharedUpdater(store, clientMutationId, newEdge);
          const userProxy = store.get(clientMutationId);
          userProxy.setValue(
            userProxy.getValue('first') + 1,
            'first',
          );
        }
      },
    },
  )
}

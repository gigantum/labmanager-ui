import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'
import RelayRuntime from 'relay-runtime'

const mutation = graphql`
  mutation AddEnvironmentPackageMutation($input: AddEnvironmentPackageInput!){
    addEnvironmentPackage(input: $input){
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
    'PackageManagerDependencies_packageManagerDependencies',
    {'first': 20}
  );
  if(conn){
    RelayRuntime.ConnectionHandler.insertEdgeAfter(conn, newEdge);
  }

}


export default function AddEnvironmentPackageMutation(
  labbookName,
  owner,
  packageManager,
  packageName,
  clientMutationId,
  callback
) {
  const variables = {
    input: {
      labbookName,
      owner,
      packageManager,
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
        if(clientMutationId){
          //TODO use edge from linked record
          const id = 'client:PackageManagerDependencies:' + tempID++;
          const node = store.create(id, 'package');
          node.setValue(packageManager, 'packageManager')
          node.setValue(packageName, 'packageName')
          node.setValue(labbookName, 'labbookName')
          node.setValue(owner, 'owner')

          const newEdge = store.create(
            'client:newEdge:' + tempID,
            'PackageManagerEdge',
          );

          newEdge.setLinkedRecord(node, 'node');

          sharedUpdater(store, clientMutationId, newEdge);
        }
      },
      optimisticUpdater: (store) => {

        if(clientMutationId){

          const id = 'client:newPackageManager:' + tempID++;
          const node = store.create(id, 'PackageManager');

          node.setValue(packageManager, 'packageManager')
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

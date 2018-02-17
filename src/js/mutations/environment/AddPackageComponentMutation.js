import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'
import RelayRuntime from 'relay-runtime'
let tempID = 0;
const mutation = graphql`
  mutation AddPackageComponentMutation($input: AddPackageComponentInput!){
    addPackageComponent(input: $input){
      newPackageComponentEdge{
        node{
          id
          schema
          manager
          package
          version
          latestVersion
          fromBase
        }
      }
      clientMutationId
    }
  }
`;

/**
  @param {object, string, object} store,id,newEdge
  gets a connection to the store and insets an edge if connection is Successful
*/
function sharedUpdater(store, id, newEdge) {

  const userProxy = store.get(id);
  const conn = RelayRuntime.ConnectionHandler.getConnection(
    userProxy,
    'PackageDependencies_packageDependencies',
    []
  );

  if(conn){
    RelayRuntime.ConnectionHandler.insertEdgeAfter(conn, newEdge);
  }

}

function sharedDeleteUpdater(store, parentID, deletedId) {
  const userProxy = store.get(parentID);

  const conn = RelayRuntime.ConnectionHandler.getConnection(
    userProxy,
    'PackageDependencies_packageDependencies',
  );

  if(conn){
    RelayRuntime.ConnectionHandler.deleteNode(
      conn,
      deletedId,
    );
  }
}

export default function AddPackageComponentMutation(
  labbookName,
  owner,
  manager,
  packageName,
  version,
  clientMutationId,
  environmentId,
  connection,
  callback
) {


  const variables = {
    input: {
      labbookName,
      owner,
      manager,
      package: packageName,
      version,
      clientMutationId: tempID++
    }
  }
  commitMutation(
    environment,
    {
      mutation,
      variables,
      config: [{
        type: 'RANGE_ADD',
        parentID: environmentId,
        connectionInfo: [{
          key: 'PackageDependencies_packageDependencies',
          rangeBehavior: 'prepend',
        }],
        edgeName: 'newPackageComponentEdge',
      }],
      onCompleted: (response, error) => {
        if(error){
          console.log(error)
        }
        callback(response, error)
      },
      onError: err => console.error(err),
      updater: (store, response) => {
        console.log(store)
        if(clientMutationId){
          let deletedId = 'client:newPackageManager:' + tempID
          sharedDeleteUpdater(store, environmentId, deletedId)
          const {
              schema,
              version,
              latestVersion,
              fromBase } = response.addPackageComponent.newPackageComponentEdge.node

          //TODO use edge from linked record
          const id = response.addPackageComponent.newPackageComponentEdge.node.id
          store.delete(id)
          const node = store.create(id, 'package');
          node.setValue(manager, 'manager')
          node.setValue(packageName, 'package')
          node.setValue(version, 'version')
          node.setValue(schema, 'schema')
          node.setValue(latestVersion, 'latestVersion')
          node.setValue(fromBase, 'fromBase')
          node.setValue(response.addPackageComponent.newPackageComponentEdge.node.id, 'id')

          const newEdge = store.create(
            'client:newEdge:' + tempID,
            'PackageComponentEdge',
          );

          newEdge.setLinkedRecord(node, 'node');

          sharedUpdater(store, environmentId, newEdge);
        }
      },
      optimisticUpdater: (store) => {

        if(clientMutationId){

          const id = 'client:newPackageManager:' + tempID++;
          const node = store.create(id, 'PackageManager');

          node.setValue(manager, 'manager')
          node.setValue(packageName, 'packageName')
          node.setValue(labbookName, 'labbookName')
          node.setValue(owner, 'owner')
          const newEdge = store.create(
            'client:newEdge:' + tempID,
            'PackageComponentEdge',
          );

          newEdge.setLinkedRecord(node, 'node');

          sharedUpdater(store, environmentId, newEdge);
          const userProxy = store.get(environmentId);
          userProxy.setValue(
            userProxy.getValue('first') + 1,
            'first',
          );
        }
      },
    },
  )
}

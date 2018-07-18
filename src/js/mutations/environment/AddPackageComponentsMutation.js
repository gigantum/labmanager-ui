import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'
import RelayRuntime from 'relay-runtime'
let tempID = 0;
const mutation = graphql`
  mutation AddPackageComponentsMutation($input: AddPackageComponentsInput!){
    addPackageComponents(input: $input){
      newPackageComponentEdges{
        node{
          id
          schema
          manager
          package
          version
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
  const labbookProxy = store.get(id);
  if(labbookProxy) {
    const conn = RelayRuntime.ConnectionHandler.getConnection(
      labbookProxy,
      'PackageDependencies_packageDependencies',
      []
    );

    if(conn){
      RelayRuntime.ConnectionHandler.insertEdgeAfter(conn, newEdge);
    }
  }
}

function sharedDeleteUpdater(store, parentID, deletedId) {
  const labbookProxy = store.get(parentID);
  if(labbookProxy){
    const conn = RelayRuntime.ConnectionHandler.getConnection(
      labbookProxy,
      'PackageDependencies_packageDependencies',
    );

    if(conn){
      RelayRuntime.ConnectionHandler.deleteNode(
        conn,
        deletedId,
      );
    }
  }
}

function sharedDeleter(store, parentID, deletedIdArr, connectionKey) {
  const environmentProxy = store.get(parentID);
  if(environmentProxy) {
    deletedIdArr.forEach(deleteId =>{
      const conn = RelayRuntime.ConnectionHandler.getConnection(
        environmentProxy,
        connectionKey,
      );

      if(conn){
        RelayRuntime.ConnectionHandler.deleteNode(
          conn,
          deleteId,
        );
        store.delete(deleteId)
      }
    })
  }
}

export default function AddPackageComponentsMutation(
  labbookName,
  owner,
  packages,
  clientMutationId,
  environmentId,
  connection,
  duplicates,
  callback
) {

  const variables = {
    input: {
      labbookName,
      owner,
      packages,
      clientMutationId: tempID++
    }
  }

  const config = [{
    type: 'RANGE_ADD',
    parentID: environmentId,
    connectionInfo: [{
      key: 'PackageDependencies_packageDependencies',
      rangeBehavior: 'prepend',
    }],
    edgeName: 'newPackageComponentEdge',
  }]

  if(duplicates.length) {
    duplicates.forEach((id) =>{
      config.unshift({
        type: 'NODE_DELETE',
        deletedIDFieldName: id,
      })
    })
  }

  commitMutation(
    environment,
    {
      mutation,
      variables,
      config,
      onCompleted: (response, error) => {
        if(error){
          console.log(error)
        }
        callback(response, error)
      },
      onError: err => console.error(err),
      updater: (store, response) => {
        if(response.addPackageComponents && response.addPackageComponents.newPackageComponentEdges && response.addPackageComponents.newPackageComponentEdges.length && clientMutationId){
          let deletedId = 'client:newPackageManager:' + tempID
          sharedDeleteUpdater(store, environmentId, deletedId)
          let newEdges = response.addPackageComponents.newPackageComponentEdges;
          newEdges.forEach((edge) =>{
            const {fromBase, id, manager, schema, version, latestVersion} = edge.node
            let pkg = edge.node.package;
            store.delete(id);
            const node = store.create(id, 'package');
            if(node) {
              node.setValue(manager, 'manager')
              node.setValue(pkg, 'package')
              node.setValue(version, 'version')
              node.setValue(schema, 'schema')
              node.setValue(fromBase, 'fromBase')
              node.setValue(latestVersion, 'latestVersion')
              node.setValue(id, 'id')
              const newEdge = store.create(
                'client:newEdge:' + tempID++,
                'PackageComponentEdge',
              );

              newEdge.setLinkedRecord(node, 'node');
              sharedDeleter(store, environmentId, duplicates, 'PackageDependencies_packageDependencies')
              sharedUpdater(store, environmentId, newEdge);
            }
          })
        }
      },
      optimisticUpdater: (store) => {
        if(clientMutationId){
          const id = 'client:newPackageManager:' + tempID++;
          const node = store.create(id, 'PackageManager');
          packages.forEach((item) =>{
            const {manager, version} = item
            const pkg = item.package
            node.setValue(manager, 'manager')
            node.setValue(pkg, 'package')

            node.setValue(version, 'version')
            node.setValue(labbookName, 'labbookName')
            node.setValue(owner, 'owner')
          })


          const newEdge = store.create(
            'client:newEdge:' + tempID,
            'PackageComponentEdge',
          );
          if(newEdge) {
            newEdge.setLinkedRecord(node, 'node');
          }
          sharedDeleter(store, environmentId, duplicates, 'PackageDependencies_packageDependencies')
          sharedUpdater(store, environmentId, newEdge);

          const labbookProxy = store.get(environmentId);
          if(labbookProxy) {
            labbookProxy.setValue(
              labbookProxy.getValue('first') + 1,
              'first',
            );
          }
        }
      },
    },
  )
}

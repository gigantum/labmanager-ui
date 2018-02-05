import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'
import RelayRuntime from 'relay-runtime'
let tempID = 0;
const mutation = graphql`
  mutation RemovePackageComponentMutation($input: RemovePackageComponentInput!){
    removePackageComponent(input: $input){
      success
      clientMutationId
    }
  }
`;

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

export default function RemovePackageComponentMutation(
  labbookName,
  owner,
  manager,
  packageName,
  nodeID,
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
      clientMutationId: tempID++
    }
  }
  commitMutation(
    environment,
    {
      mutation,
      variables,
      config: [{
        type: 'NODE_DELETE',
        deletedIDFieldName: nodeID,
      }],
      onCompleted: (response, error) => {
        if(error){
          console.log(error)
        }
        callback(response, error)
      },
      onError: err => console.error(err),
      updater: (store, response) => {
        console.log(store, response)
        sharedUpdater(store, environmentId, nodeID, 'PackageDependencies_packageDependencies')
      },
      optimisticUpdater: (store) => {
        sharedUpdater(store, environmentId, nodeID, 'PackageDependencies_packageDependencies')
      },
    },
  )
}

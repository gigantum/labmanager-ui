import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'
import RelayRuntime from 'relay-runtime'
let tempID = 0;
const mutation = graphql`
  mutation RemovePackageComponentsMutation($input: RemovePackageComponentsInput!){
    removePackageComponents(input: $input){
      success
      clientMutationId
    }
  }
`;

function sharedUpdater(store, parentID, deletedIdArr, connectionKey) {
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

export default function RemovePackageComponentsMutation(
  labbookName,
  owner,
  manager,
  packages,
  packageIDArr,
  clientMutationId,
  environmentId,
  connection,
  callback
) {

  const config = packageIDArr.map(id => {
    return {
      type: 'NODE_DELETE',
      deletedIDFieldName: id,
    }
  })


  const variables = {
    input: {
      labbookName,
      owner,
      manager,
      packages,
      clientMutationId: tempID++
    }
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
        sharedUpdater(store, environmentId, packageIDArr, 'PackageDependencies_packageDependencies')
      },
      optimisticUpdater: (store) => {
        sharedUpdater(store, environmentId, packageIDArr, 'PackageDependencies_packageDependencies')
      },
    },
  )
}

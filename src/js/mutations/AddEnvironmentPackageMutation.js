import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from '../createRelayEnvironment'
import RelayRuntime from 'relay-runtime'

const mutation = graphql`
  mutation AddEnvironmentPackageMutation($input: AddEnvironmentPackageInput!){
    addEnvironmentPackage(input: $input){
      clientMutationId
    }
  }
`;

let tempID = 0;

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
      clientMutationId: tempID++
    }
  }
  commitMutation(
    environment,
    {
      mutation,
      variables,
      onCompleted: (response) => {

        callback()
      },
      onError: err => console.error(err),

      updater: (store) => {
        const id = 'client:newLabbook:'+ tempID++;
        const node = store.create(id, 'Packages')

          node.setValue(packageManager, 'packageManager')
          node.setValue(packageName, 'packageName')
          node.setValue(labbookName, 'labbookName')
          node.setValue(owner, 'owner')

         //const labbookProxy = store.getRootField('createLabbook');
         //const node = payload.getLinkedRecord('labbook').getLinkedRecord('node');
         console.log(store, node)
         const pacakgeProxyProxy = store.get('client:root');
         console.log(pacakgeProxyProxy)
         const conn = RelayRuntime.ConnectionHandler.getConnection(
           pacakgeProxyProxy,
           'PackageManager_packageManagerDependencies',
         );

         console.log(conn)

         if(conn){
           const newEdge = RelayRuntime.ConnectionHandler.createEdge(
             store,
             conn,
             node,
             "PackageEdge"
           )
           RelayRuntime.ConnectionHandler.insertEdgeAfter(conn, newEdge)
        }
      },
    },
  )
}

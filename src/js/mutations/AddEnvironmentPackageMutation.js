import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from '../createRelayEnvironment'
import RelayRuntime from 'relay-runtime'
import storeDebugger from 'relay-runtime/lib/RelayStoreProxyDebugger'

const mutation = graphql`
  mutation AddEnvironmentPackageMutation($input: AddEnvironmentPackageInput!){
    addEnvironmentPackage(input: $input){
      clientMutationId
    }
  }
`;

let tempID = 0;

function sharedUpdater(store, id, newEdge) {
  const userProxy = store.get(id);

  const conn = RelayRuntime.ConnectionHandler.getConnection(
    userProxy,
    'Environment_packageManagerDependencies',
    {'first': 20}
  );

  RelayRuntime.ConnectionHandler.insertEdgeAfter(conn, newEdge);
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
      onCompleted: (response) => {

        callback()
      },
      onError: err => console.error(err),

      updater: (store) => {
        const payload = store.getRootField('addEnvironmentPackage');

        const newEdge = payload.getLinkedRecord('PackageManagerEdge');

        sharedUpdater(store, clientMutationId, newEdge);
      },
      optimisticUpdater: (store) => {
        const id = 'client:newPackage:' + tempID++;
        const node = store.create(id, 'package');
        node.setValue(packageManager, 'packageManager')
        node.setValue(packageName, 'packageName')
        node.setValue(labbookName, 'labbookName')
        node.setValue(owner, 'owner')
        const newEdge = store.create(
          'client:newEdge:' + tempID++,
          'PackageManagerEdge',
        );
        newEdge.setLinkedRecord(node, 'node');

        sharedUpdater(store, clientMutationId, newEdge);
        const userProxy = store.get(clientMutationId);
        userProxy.setValue(
          userProxy.getValue('totalCount') + 1,
          'totalCount',
        );
      },
    },
  )
}

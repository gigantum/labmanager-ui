import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from '../createRelayEnvironment'
import RelayRuntime from 'relay-runtime'

const mutation = graphql`
  mutation AddEnvironmentComponentMutation($input: AddEnvironmentComponentInput!){
    addEnvironmentComponent(input: $input){
      clientMutationId
    }
  }
`;

let tempID = 0;

export default function AddEnvironmentComponentMutation(
  labbookName,
  owner,
  repository,
  namespace,
  component,
  version,
  clientMutationId,
  componentClass,
  callback
) {
  const variables = {
    input: {
      labbookName,
      owner,
      repository,
      namespace,
      component,
      version,
      clientMutationId,
      componentClass,
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

        // const id = 'client:newLabbook:'+ tempID++;
        // const node = store.create(id, 'Labbook')
        //
        //   node.setValue(name, 'name')
        //   node.setValue(description, 'description')
        //
        //  //const labbookProxy = store.getRootField('createLabbook');
        //  //const node = payload.getLinkedRecord('labbook').getLinkedRecord('node');
        //  //
        //  const labbookProxy = store.get('client:root');
        //
        //  const conn = RelayRuntime.ConnectionHandler.getConnection(
        //    labbookProxy,
        //    'LocalLabbooks_localLabbooks',
        //  );
        //
        //  if(conn){
        //    const newEdge = RelayRuntime.ConnectionHandler.createEdge(
        //      store,
        //      conn,
        //      node,
        //      "LabbookEdge"
        //    )
        //    RelayRuntime.ConnectionHandler.insertEdgeAfter(conn, newEdge)
        // }

      },
    },
  )
}

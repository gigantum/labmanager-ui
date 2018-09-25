import {
  commitMutation,
  graphql,
} from 'react-relay';
import environment from 'JS/createRelayEnvironment';
import RelayRuntime from 'relay-runtime';

const mutation = graphql`
  mutation CreateLabbookMutation($input: CreateLabbookInput!){
    createLabbook(input: $input){
      labbook{
        id
        name
        owner
      }
    }
  }
`;

let tempID = 0;
export default function CreateLabbookMutation(
  name,
  description,
  repository,
  componentId,
  revision,
  isUntracked,
  callback,
) {
  const variables = {
    input: {
      name,
      description,
      repository,
      componentId,
      revision,
      isUntracked,
      clientMutationId: tempID++,
    },
  };
  commitMutation(
    environment,
    {
      mutation,
      variables,
      onCompleted: (response, error) => {
        if (error) {
          console.log(error);
        }

        callback(response, error);
      },
      onError: err => console.error(err),
      updater: (store) => {
        const id = `client:newLabbook:${tempID++}`;
        const node = store.create(id, 'Labbook');

        node.setValue(name, 'name');
        node.setValue(description, 'description');

        const labbookProxy = store.get('client:root');

        const conn = RelayRuntime.ConnectionHandler.getConnection(
          labbookProxy,
          'LocalLabbooks_localLabbooks',
        );

        if (conn) {
          RelayRuntime.ConnectionHandler.createEdge(
            store,
            conn,
            node,
            'LabbookEdge',
          );
          // RelayRuntime.ConnectionHandler.insertEdgeAfter(conn, newEdge)
        }
      },
    },
  );
}

export { mutation };

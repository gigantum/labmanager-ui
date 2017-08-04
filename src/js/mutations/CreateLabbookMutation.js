import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from '../createRelayEnvironment'
import {ConnectionHandler} from 'relay-runtime'

const mutation = graphql`
  mutation CreateLabbookMutation($input: CreateLabbookInput!){
    createLabbook(input: $input){
      labbook{
        id
      }
    }
  }
`;

function sharedUpdater(store, id, newEdge) {
  const labbookProxy = store.get('client:root');
  const conn = ConnectionHandler.getConnection(
    labbookProxy,
    'LabbookSets_localLabbooks'
  );
  ConnectionHandler.insertEdgeAfter(conn, newEdge);
}

let tempID = 0;

export default function CreateLabbookMutation(
  description,
  name,
  viewerId,
  callback
) {
  const variables = {
    input: {
      description,
      name,
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
      optimisticUpdater: (store) => {

        // 1 - create the `labbook` as a mock that can be added to the store
        const id = 'client:newLabbook:'+ tempID++;
        const node = store.create(id, 'Labbook')

        node.setValue(name, 'name')
        node.setValue(description, 'description')

        const newEdge = store.create(
          'client:newEdge:' + tempID++,
          'LabbookEdge',
        );

        newEdge.setLinkedRecord(node, 'node');
        sharedUpdater(store, id, newEdge);
        const labbookProxy = store.get('client:root');

        labbookProxy.setValue(
          labbookProxy.getValue('totalCount') + 1,
          'totalCount',
        );

      },
      updater: (store) => {

        // 1 - retrieve the `newPost` from the server response

        const payload = store.getRootField('createLabbook')

        const newEdge = payload.getLinkedRecord('labbookEdge');


        if(newEdge){
          sharedUpdater(store, "", newEdge);
        }


      },
    },
  )
}

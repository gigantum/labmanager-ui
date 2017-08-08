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
  console.log(conn)
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

      updater: (store) => {

        const id = 'client:newLabbook:'+ tempID++;
        const node = store.create(id, 'Labbook')

          node.setValue(name, 'name')
          node.setValue(description, 'description')

         const payload = store.getRootField('createLabbook');
         //const node = payload.getLinkedRecord('labbook').getLinkedRecord('node');
         const labbookProxy = store.get('client:root');
         const conn = ConnectionHandler.getConnection(
           labbookProxy,
           'LabbookSets_localLabbooks',
         );
         const newEdge = ConnectionHandler.createEdge(
           store,
           conn,
           node,
           "LabbookEdge"
         )
         ConnectionHandler.insertEdgeAfter(conn, newEdge)

      },
    },
  )
}

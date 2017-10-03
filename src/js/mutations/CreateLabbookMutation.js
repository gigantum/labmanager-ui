import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'
import RelayRuntime from 'relay-runtime'

const mutation = graphql`
  mutation CreateLabbookMutation($input: CreateLabbookInput!){
    createLabbook(input: $input){
      labbook{
        id
      }
    }
  }
`;
const configs = [{
  type: 'RANGE_ADD',
  parentID: 'client:root',
  connectionInfo: [{
    key: 'LocalLabbooks_localLabbooks',
    rangeBehavior: 'append',
  }],
  edgeName: 'newLabbookEdge',
}];
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
      configs: configs,
      onCompleted: (response, error) => {

        if(error){
          console.log(error)
        }

        callback(error)
      },
      onError: err => {console.error(err)},
      updater: (store) => {

        const id = 'client:newLabbook:'+ tempID++;
        const node = store.create(id, 'Labbook')

          node.setValue(name, 'name')
          node.setValue(description, 'description')

         const labbookProxy = store.get('client:root');

         const conn = RelayRuntime.ConnectionHandler.getConnection(
           labbookProxy,
           'LocalLabbooks_localLabbooks',
         );

         if(conn){
           const newEdge = RelayRuntime.ConnectionHandler.createEdge(
             store,
             conn,
             node,
             "LabbookEdge"
           )
           //RelayRuntime.ConnectionHandler.insertEdgeAfter(conn, newEdge)
        }

      },
    },
  )
}

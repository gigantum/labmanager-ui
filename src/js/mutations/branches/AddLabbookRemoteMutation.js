import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'
import RelayRuntime from 'relay-runtime'

const mutation = graphql`
  mutation AddLabbookRemoteMutation($input: AddLabbookRemoteInput!){
    addLabbookRemote(input: $input){
      success
      clientMutationId
    }
  }
`;

let tempID = 0;

export default function AddLabbookRemoteMutation(
  owner,
  labbookName,
  remoteName,
  remoteUrl,
  labbookId,
  callback
) {


  const variables = {
    input: {
      owner,
      labbookName,
      remoteName,
      remoteUrl,
      clientMutationId: tempID++
    }
  }
  console.log(variables)
  commitMutation(
    environment,
    {
      mutation,
      variables,
      // configs: {
      //   type: 'RANGE_ADD',
      //   parentID: labbookId,
      //   connectionInfo: [{
      //     key: 'Branches_Branches',
      //     rangeBehavior: 'append',
      //   }],
      //   edgeName: 'newBranchEdge',
      // },
      onCompleted: (response, error) => {

        if(error){
          console.log(error)
        }

        callback(error)
      },
      onError: err => {console.error(err)},
      updater: (store, response) => {
        console.log(store, response)
        // const id = 'client:newLabbook:'+ tempID++;
        // const node = store.create(id, 'Labbook')
        //
        //   node.setValue(name, 'name')
        //   node.setValue(description, 'description')
        //
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
        //    //RelayRuntime.ConnectionHandler.insertEdgeAfter(conn, newEdge)
        }

      //},
    },
  )
}

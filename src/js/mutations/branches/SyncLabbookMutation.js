import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'
import RelayRuntime from 'relay-runtime'

const mutation = graphql`
  mutation SyncLabbookMutation($input: SyncLabbookInput!){
    syncLabbook(input: $input){
      updateCount
      clientMutationId
    }
  }
`;

let tempID = 0;

export default function SyncLabbookMutation(
  owner,
  labbookName,
  callback
) {


  const variables = {
    input: {
      owner,
      labbookName,
      clientMutationId: tempID++
    }
  }

  commitMutation(
    environment,
    {
      mutation,
      variables,
      onCompleted: (response, error) => {

        if(error){
          console.log(error)
        }

        callback(error)
      },
      onError: err => {console.error(err)},
      updater: (store, response) => {
      }
    },
  )
}

import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'

const mutation = graphql`
  mutation ExportLabbookMutation($input: ExportLabbookInput!){
    exportLabbook(input: $input){
      clientMutationId
      jobKey
    }
  }
`;

let tempID = 0;

export default function ExportLabbookMutation(
  user,
  owner,
  labbookName,
  callback
) {
  const variables = {
    input: {
      owner,
      user,
      labbookName,
      clientMutationId: '' + tempID++
    }
  }
  commitMutation(
    environment,
    {
      mutation,
      variables,
      onCompleted: (response, error ) => {
        console.log(response)
        if(error){
          console.log(error)
        }
        callback(response, error)
      },
      onError: err => console.error(err),

      updater: (store) => {


      },
    },
  )
}

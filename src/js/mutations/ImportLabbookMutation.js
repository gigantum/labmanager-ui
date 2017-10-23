import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'

const mutation = graphql`
  mutation ImportLabbookMutation($input: ImportLabbookInput!){
    importLabbook(input: $input){
      clientMutationId
      importJobKey
      buildImageJobKey
    }
  }
`;

let tempID = 0;

export default function ImportLabbookMutation(
  user,
  owner,
  uploadables,
  callback
) {
  const variables = {
    input: {
      owner,
      user,
      clientMutationId: '' + tempID++
    }
  }
  commitMutation(
    environment,
    {
      mutation,
      variables,
      uploadables,
      onCompleted: (response, error ) => {
  
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

import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'


const mutation = graphql`
  mutation DeleteLabbookFileMutation($input: DeleteLabbookFileInput!){
    deleteLabbookFile(input: $input){
      success
      clientMutationId
    }
  }
`;

let tempID = 0;

export default function DeleteLabbookFileMutation(
  user,
  owner,
  labbookName,
  filePath,
  callback
) {
  const variables = {
    input: {
      user,
      owner,
      labbookName,
      filePath,
      clientMutationId: '' + tempID++
    }
  }
  commitMutation(
    environment,
    {
      mutation,
      variables,
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

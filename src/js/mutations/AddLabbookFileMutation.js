import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'


const mutation = graphql`
  mutation AddLabbookFileMutation($input: AddLabbookFileInput!){
    addLabbookFile(input: $input){
      newLabbookFileEdge{
        node{
          id
          isDir
          modifiedAt
          key
          size
        }
        cursor
      }
      clientMutationId
    }
  }
`;

let tempID = 0;

export default function AddLabbookFileMutation(
  user,
  owner,
  labbookName,
  filePath,
  uploadables,
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
  console.log(uploadables)
  commitMutation(
    environment,
    {
      mutation,
      variables,
      uploadables,
      onCompleted: (response, error ) => {
        console.log(response, error)
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

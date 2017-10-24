import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'


const mutation = graphql`
  mutation MoveLabbookFileMutation($input: MoveLabbookFileInput!){
    moveLabbookFile(input: $input){
      user
      owner
      labbookName
      srcPath
      dstPath
      clientMutationId
    }
  }
`;

let tempID = 0;

export default function MoveLabbookFileMutation(
  user,
  owner,
  labbookName,
  srcPath,
  dstPath,
  callback
) {
  const variables = {
    input: {
      user,
      owner,
      labbookName,
      srcPath,
      dstPath,
      clientMutationId: '' + tempID++
    }
  }
  commitMutation(
    environment,
    {
      mutation,
      variables,
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

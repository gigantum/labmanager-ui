import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'


const mutation = graphql`
  mutation MakeLabbookDirectoryMutation($input: MakeLabbookDirectoryInput!){
    makeLabbookDirectory(input: $input){
      user
      owner
      labbookName
      dirname
      clientMutationId
    }
  }
`;

let tempID = 0;

export default function MakeLabbookDirectoryMutation(
  user,
  owner,
  labbookName,
  dirname,
  callback
) {
  const variables = {
    input: {
      user,
      owner,
      labbookName,
      dirname,
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

import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'

const mutation = graphql`
  mutation StartDevToolMutation($input: StartDevToolInput!){
    startDevTool(input: $input){
      path
      clientMutationId
    }
  }
`;

let tempID = 0;


export default function AddEnvironmentPackageMutation(
  owner,
  labbookName,
  devTool,
  callback
) {
  const variables = {
    input: {
      labbookName,
      owner,
      devTool,
      clientMutationId:  tempID++
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
        callback(response, error)
      },
      onError: err => console.error(err)
    },
  )
}

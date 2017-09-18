import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from '../createRelayEnvironment'


const mutation = graphql`
  mutation BuildImageMutation($input: BuildImageInput!){
    buildImage(input: $input){
      clientMutationId
    }
  }
`;

let tempID = 0;

export default function BuildImageMutation(
  labbookName,
  owner,
  callback
) {
  const variables = {
    input: {
      labbookName,
      owner,
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
      onError: err => console.error(err),

      updater: (store) => {


      },
    },
  )
}

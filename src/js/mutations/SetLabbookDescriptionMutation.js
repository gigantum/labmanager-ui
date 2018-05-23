import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'


const mutation = graphql`
  mutation SetLabbookDescriptionMutation($input: SetLabbookDescriptionInput!){
    setLabbookDescription(input: $input){
      success
      clientMutationId
    }
  }
`;

let tempID = 0;


export default function SetLabbookDescriptionMutation(
  owner,
  labbookName,
  descriptionContent,
  callback
) {

  const variables = {
    input: {
      owner,
      labbookName,
      descriptionContent,
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
    },
  )
}

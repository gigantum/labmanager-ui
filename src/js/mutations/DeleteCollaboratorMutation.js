import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'
//redux store
import reduxStore from 'JS/redux/store'


const mutation = graphql`
  mutation DeleteCollaboratorMutation($input: DeleteLabbookCollaboratorInput!){
    deleteCollaborator(input: $input){
      updatedLabbook{
        id
        collaborators
      }
      clientMutationId
    }
  }
`;

let tempID = 0;

export default function DeleteCollaboratorMutation(
  labbookName,
  owner,
  username,
  callback
) {
  const variables = {
    input: {
      labbookName,
      owner,
      username,
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
          reduxStore.dispatch({
            type: 'ERROR_MESSAGE',
            payload:{
              message: `Error: Could not add Collaborator ${username}`,
              messageBody: error
            }
          })
        }
        callback(response, error)
      },
      onError: err => console.error(err),

      updater: (store) => {


      },
    },
  )
}

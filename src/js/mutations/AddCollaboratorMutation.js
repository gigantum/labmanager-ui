import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'
//redux store
import reduxStore from 'JS/redux/store'


const mutation = graphql`
  mutation AddCollaboratorMutation($input: AddLabbookCollaboratorInput!){
    addCollaborator(input: $input){
      updatedLabbook{
        id
        collaborators
      }
      clientMutationId
    }
  }
`;

let tempID = 0;

export default function AddCollaboratorMutation(
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
        console.log(error)
        if(error){
          console.log(error)
          reduxStore.dispatch({
            type: 'UPLOAD_MESSAGE',
            payload:{
              error: true,
              uploadMessage: `Could not add Collaborator ${username}`,
              showProgressBar: false,
              open: true,
              success: false
            }
          })
        }
        callback(error)
      },
      onError: err => console.error(err)
    },
  )
}

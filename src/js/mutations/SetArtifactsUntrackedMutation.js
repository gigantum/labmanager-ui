import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'
//redux store
import reduxStore from 'JS/redux/store'


const mutation = graphql`
  mutation SetArtifactsUntrackedMutation($input: SetArtifactsUntrackedInput!){
    setArtifactsUntracked(input: $input){
      success
      clientMutationId
    }
  }
`;

let tempID = 0;

export default function SetArtifactsUntrackedMutation(
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
          reduxStore.dispatch({
            type: 'ERROR_MESSAGE',
            payload:{
              message: 'ERROR: LabBook failed to build:',
              messagesList: error
            }
          })
        }

        callback(response, error)
      }
    },
  )
}

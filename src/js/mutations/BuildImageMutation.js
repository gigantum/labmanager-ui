import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'
//redux store
import reduxStore from 'JS/redux/store'


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
        console.log(error)
        if(error){
          console.log(error)
          reduxStore.dispatch({
            type: 'UPLOAD_MESSAGE',
            payload:{
              error: true,
              message: 'LabBook failed to build',
              showProgressBar: false,
              open: true,
              success: false
            }

          })
        }
        callback(error)
      },
      onError: err => console.error(err),

      updater: (store) => {


      },
    },
  )
}

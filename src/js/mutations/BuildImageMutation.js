import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'
//redux store
import reduxStore from 'JS/redux/store'
//utils
import FooterUtils from 'Components/shared/footer/FooterUtils'


const mutation = graphql`
  mutation BuildImageMutation($input: BuildImageInput!){
    buildImage(input: $input){
      clientMutationId
      backgroundJobKey
    }
  }
`;

let tempID = 0;

export default function BuildImageMutation(
  labbookName,
  owner,
  noCache,
  callback
) {

  const variables = {
    input: {
      labbookName,
      owner,
      noCache,
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
              message: 'ERROR: Project failed to build:',
              messageBody: error
            }
          })
        }

        FooterUtils.getJobStatus(response, 'buildImage', 'backgroundJobKey')
        callback(response, error)
      },
      onError: err => console.error(err),

      updater: (store) => {


      },
    },
  )
}

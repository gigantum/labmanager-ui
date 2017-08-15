import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from '../createRelayEnvironment'
import RelayRuntime from 'relay-runtime'

const mutation = graphql`
  mutation StartContainerMutation($input: StartContainerInput!){
    startContainer(input: $input){
      clientMutationId
    }
  }
`;

let tempID = 0;

export default function StartContainerMutation(
  labbookName,
  owner,
  clientMutationId,
  callback
) {
  const variables = {
    input: {
      labbookName,
      owner,
      clientMutationId: '' + tempID++
    }
  }
  commitMutation(
    environment,
    {
      mutation,
      variables,
      onCompleted: (response) => {

        callback()
      },
      onError: err => console.error(err),

      updater: (store) => {


      },
    },
  )
}

import {
  commitMutation,
  graphql,
} from 'react-relay';
import environment from 'JS/createRelayEnvironment';

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
  callback,
) {
  const variables = {
    input: {
      labbookName,
      owner,
      clientMutationId: `${tempID++}`,
    },
  };
  commitMutation(
    environment,
    {
      mutation,
      variables,
      onCompleted: (response, error) => {
        if (error) {
          console.log(error);
        }
        callback(response, error);
      },
      onError: err => console.error(err),

      updater: (store) => {


      },
    },
  );
}

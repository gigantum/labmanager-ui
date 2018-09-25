import {
  commitMutation,
  graphql,
} from 'react-relay';
import environment from 'JS/createRelayEnvironment';

const mutation = graphql`
  mutation DeleteLabbookMutation($input: DeleteLabbookInput!){
    deleteLabbook(input: $input){
      success
      clientMutationId
    }
  }
`;
let tempID = 0;

export default function DeleteLabbookMutation(
  labbookName,
  owner,
  confirm,
  callback,
) {
  const variables = {
    input: {
      labbookName,
      owner,
      confirm,
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
    },
  );
}

import {
  commitMutation,
  graphql,
} from 'react-relay';
import environment from 'JS/createRelayEnvironment';


const mutation = graphql`
  mutation RemoveUserIdentityMutation($input: RemoveUserIdentityInput!){
    removeUserIdentity(input: $input){
      clientMutationId
    }
  }
`;

let tempID = 0;

export default function RemoveUserIdentityMutation(callback) {
  const variables = {
    input: {
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

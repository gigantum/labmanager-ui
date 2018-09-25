import {
  commitMutation,
  graphql,
} from 'react-relay';
import environment from 'JS/createRelayEnvironment';


const mutation = graphql`
  mutation SetVisibilityMutation($input: SetVisibilityInput!){
    setVisibility(input: $input){
      newLabbookEdge{
        node{
          visibility
        }
      }
      clientMutationId
    }
  }
`;

let tempID = 0;


export default function SetVisibilityMutation(
  owner,
  labbookName,
  visibility,
  callback,
) {
  const variables = {
    input: {
      owner,
      labbookName,
      visibility,
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
    },
  );
}

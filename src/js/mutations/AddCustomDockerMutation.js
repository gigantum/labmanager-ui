import {
  commitMutation,
  graphql,
} from 'react-relay';
import environment from 'JS/createRelayEnvironment';


const mutation = graphql`
  mutation AddCustomDockerMutation($input: AddCustomDockerInput!){
    addCustomDocker(input: $input){
      updatedEnvironment {
        dockerSnippet
      }
      clientMutationId
    }
  }
`;

let tempID = 0;


export default function AddCustomDockerMutation(
  owner,
  labbookName,
  dockerContent,
  callback,
) {
  const variables = {
    input: {
      owner,
      labbookName,
      dockerContent,
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

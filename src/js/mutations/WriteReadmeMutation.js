import {
  commitMutation,
  graphql,
} from 'react-relay';
import environment from 'JS/createRelayEnvironment';


const mutation = graphql`
  mutation WriteReadmeMutation($input: WriteReadmeInput!){
    writeReadme(input: $input){
      updatedLabbook {
        id
        readme
      }
      clientMutationId
    }
  }
`;

let tempID = 0;


export default function WriteReadmeMutation(
  owner,
  labbookName,
  content,
  callback,
) {
  const variables = {
    input: {
      owner,
      labbookName,
      content,
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

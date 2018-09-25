import {
  commitMutation,
  graphql,
} from 'react-relay';
import environment from 'JS/createRelayEnvironment';

const mutation = graphql`
  mutation ImportRemoteLabbookMutation($input: ImportRemoteLabbookInput!){
    importRemoteLabbook(input: $input){
      newLabbookEdge{
        node{
          owner
          name
        }
      }
      clientMutationId
    }
  }
`;

let tempID = 0;

export default function ImportRemoteLabbookMutation(
  owner,
  labbookName,
  remoteUrl,
  callback,
) {
  const variables = {
    input: {
      owner,
      labbookName,
      remoteUrl,
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

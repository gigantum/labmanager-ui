import {
  commitMutation,
  graphql,
} from 'react-relay';
import uuidV4 from 'uuid/v4';
import environment from 'JS/createRelayEnvironment';

const mutation = graphql`
  mutation WorkonExperimentalBranchMutation($input: WorkonBranchInput!, $first: Int, $cursor: String, $hasNext: Boolean!){
    workonExperimentalBranch(input: $input){
      labbook{
        ...Labbook_labbook
      }
      clientMutationId
    }
  }
`;

export default function WorkonExperimentalBranchMutation(
  owner,
  labbookName,
  branchName,
  revision,
  callback,
) {
  const clientMutationId = uuidV4();
  const variables = {
    input: {
      owner,
      labbookName,
      branchName,
      clientMutationId,
    },
    first: 2,
    cursor: null,
    hasNext: false,
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
      onError: (err) => { console.error(err); },
      updater: (store, response) => {
      },
    },
  );
}

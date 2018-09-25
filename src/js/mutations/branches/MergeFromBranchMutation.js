import {
  commitMutation,
  graphql,
} from 'react-relay';
import uuidV4 from 'uuid/v4';
import environment from 'JS/createRelayEnvironment';

const mutation = graphql`
  mutation MergeFromBranchMutation($input: MergeFromBranchInput!, $first: Int, $cursor: String, $hasNext: Boolean!){
    mergeFromBranch(input: $input){
      labbook{
        ...Labbook_labbook
      }
      clientMutationId
    }
  }
`;

export default function MergeFromBranchMutation(
  owner,
  labbookName,
  otherBranchName,
  force,
  callback,
) {
  const clientMutationId = uuidV4();
  const variables = {
    input: {
      owner,
      labbookName,
      otherBranchName,
      force,
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
    },
  );
}

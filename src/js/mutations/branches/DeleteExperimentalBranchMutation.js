import {
  commitMutation,
  graphql,
} from 'react-relay';
import uuidV4 from 'uuid/v4';
import environment from 'JS/createRelayEnvironment';

const mutation = graphql`
  mutation DeleteExperimentalBranchMutation($input: DeleteExperimentalBranchInput!){
    deleteExperimentalBranch(input: $input){
      success
      clientMutationId
    }
  }
`;

export default function DeleteExperimentalBranchMutation(
  owner,
  labbookName,
  branchName,
  labbookId,
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
      optimisticUpdater(store) {
        const labbook = store.get(labbookId);
        const availableBranchNames = labbook.getValue('availableBranchNames');

        const newAvailableBranchNames = availableBranchNames.filter(listBranchName => listBranchName !== branchName);

        labbook.setValue(newAvailableBranchNames, 'availableBranchNames');

        const mergeableBranchNames = labbook.getValue('mergeableBranchNames');
        const newMergeableBranchNames = mergeableBranchNames.filter(listBranchName => listBranchName !== branchName);

        labbook.setValue(newMergeableBranchNames, 'mergeableBranchNames');
      },
      updater: (store, response) => {
        const labbook = store.get(labbookId);
        const availableBranchNames = labbook.getValue('availableBranchNames');

        const newAvailableBranchNames = availableBranchNames.filter(listBranchName => listBranchName !== branchName);

        labbook.setValue(newAvailableBranchNames, 'availableBranchNames');

        const mergeableBranchNames = labbook.getValue('mergeableBranchNames');
        const newMergeableBranchNames = mergeableBranchNames.filter(listBranchName => listBranchName !== branchName);

        labbook.setValue(newMergeableBranchNames, 'mergeableBranchNames');
      },
    },
  );
}

import {
  commitMutation,
  graphql,
} from 'react-relay'
import uuidV4 from 'uuid/v4'
import environment from 'JS/createRelayEnvironment'

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
  callback
) {

  const clientMutationId = uuidV4()
  const variables = {
    input: {
      owner,
      labbookName,
      branchName,
      clientMutationId
    }
  }
  commitMutation(
    environment,
    {
      mutation,
      variables,
      onCompleted: (response, error) => {

        if(error){
          console.log(error)
        }

        callback(response, error)
      },
      onError: err => {console.error(err)},
      optimisticUpdater(store){


        let labbook = store.get(labbookId)
        let availableBranchNames = labbook.getValue('availableBranchNames')

        let newAvailableBranchNames = availableBranchNames.filter((listBranchName)=>{
          return listBranchName !== branchName
        })

        labbook.setValue(newAvailableBranchNames, 'availableBranchNames')

        let mergeableBranchNames = labbook.getValue('mergeableBranchNames')
        let newMergeableBranchNames = mergeableBranchNames.filter((listBranchName) => {
          return listBranchName !== branchName
        })

        labbook.setValue(newMergeableBranchNames, 'mergeableBranchNames')

      },
      updater: (store, response) => {
        let labbook = store.get(labbookId)
        let availableBranchNames = labbook.getValue('availableBranchNames')

        let newAvailableBranchNames = availableBranchNames.filter((listBranchName)=>{
          return listBranchName !== branchName
        })

        labbook.setValue(newAvailableBranchNames, 'availableBranchNames')

        let mergeableBranchNames = labbook.getValue('mergeableBranchNames')
        let newMergeableBranchNames = mergeableBranchNames.filter((listBranchName) => {
          return listBranchName !== branchName
        })

        labbook.setValue(newMergeableBranchNames, 'mergeableBranchNames')
      }
    },
  )
}

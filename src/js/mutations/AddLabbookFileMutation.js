import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'


const mutation = graphql`
  mutation AddLabbookFileMutation($input: AddLabbookFileInput!){
    addLabbookFile(input: $input){
      newLabbookFileEdge{
        node{
          id
          isDir
          modifiedAt
          key
          size
        }
        cursor
      }
      clientMutationId
    }
  }
`;

let tempID = 0;

export default function AddLabbookFileMutation(
  connectionKey,
  user,
  owner,
  labbookName,
  labbookId,
  filePath,
  uploadables,
  callback
) {
  const variables = {
    input: {
      user,
      owner,
      labbookName,
      filePath,
      clientMutationId: '' + tempID++
    }
  }

  commitMutation(
    environment,
    {
      mutation,
      variables,
      uploadables,
      configs: [{ //commented out until nodes are returned
        type: 'RANGE_ADD',
        parentID: labbookId,
        connectionInfo: [{
          key: connectionKey,
          rangeBehavior: 'prepend'
        }],
        edgeName: 'newLabbookFileEdge'
      }],
      onCompleted: (response, error ) => {
        if(error){
          console.log(error)
        }
        callback(response, error)
      },
      onError: err => console.error(err),

      updater: (store) => {


      },
    },
  )
}

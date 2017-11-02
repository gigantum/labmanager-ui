import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'

const mutation = graphql`
  mutation ImportLabbookMutation($input: ImportLabbookInput!){
    importLabbook(input: $input){
      clientMutationId
      importJobKey
      buildImageJobKey
    }
  }
`;

let tempID = 0;

export default function ImportLabbookMutation(
  user,
  owner,
  blob,
  chunk,
  accessToken,
  callback
) {
  let uploadables = [blob, accessToken]
  console.log(chunk, uploadables)
  const variables = {
    input: {
      owner,
      user,
      chunkUploadParams: {
        fileSizeKb: chunk.fileSizeKb,
        chunkSize: chunk.chunkSize,
        totalChunks: chunk.totalChunks,
        chunkIndex: chunk.chunkIndex,
        filename: chunk.filename,
        uploadId: chunk.uploadId,
      },
      clientMutationId: '' + tempID++
    },

  }
  commitMutation(
    environment,
    {
      mutation,
      variables,
      uploadables,
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

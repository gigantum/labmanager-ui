import {
  commitMutation,
  graphql,
} from 'react-relay';
import environment from 'JS/createRelayEnvironment';
// utils
import FooterUtils from 'Components/shared/footer/FooterUtils';

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
  blob,
  chunk,
  accessToken,
  callback,
) {
  const uploadables = [blob, accessToken];

  const variables = {
    input: {
      chunkUploadParams: {
        fileSizeKb: chunk.fileSizeKb,
        chunkSize: chunk.chunkSize,
        totalChunks: chunk.totalChunks,
        chunkIndex: chunk.chunkIndex,
        filename: chunk.filename,
        uploadId: chunk.uploadId,
      },
      clientMutationId: `${tempID++}`,
    },

  };
  commitMutation(
    environment,
    {
      mutation,
      variables,
      uploadables,
      onCompleted: (response, error) => {
        if (error) {
          console.log(error);
        }
        if (response) {
          FooterUtils.getJobStatus(response, 'importLabbook', 'importJobKey');
          FooterUtils.getJobStatus(response, 'importLabbook', 'buildImageJobKey');
        }

        callback(response, error);
      },
      onError: err => console.error(err),

      updater: (store) => {

      },
    },
  );
}

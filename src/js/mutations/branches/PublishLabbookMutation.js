import {
  commitMutation,
  graphql,
} from 'react-relay';
import environment from 'JS/createRelayEnvironment';

import FooterUtils from 'Components/shared/footer/FooterUtils';

const mutation = graphql`
  mutation PublishLabbookMutation($input: PublishLabbookInput!){
    publishLabbook(input: $input){
      jobKey
      clientMutationId
    }
  }
`;

let tempID = 0;

export default function PublishLabbookMutation(
  owner,
  labbookName,
  labbookId,
  setPublic,
  callback,
) {
  const variables = {
    input: {
      setPublic,
      owner,
      labbookName,
      clientMutationId: tempID++,
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
      updater: (store, response) => {
        if (response) {
          FooterUtils.getJobStatus(response, 'publishLabbook', 'jobKey');
        }
      },
    },
  );
}

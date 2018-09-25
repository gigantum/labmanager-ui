// vendor
import JobStatus from 'JS/utils/JobStatus';
import store from 'JS/redux/store';
import AnsiUp from 'ansi_up';
import { setMultiInfoMessage, setErrorMessage } from 'JS/redux/reducers/footer';
import { setForceRefetch, setRefetchPending } from 'JS/redux/reducers/labbook/environment/packageDependencies';

const ansi_up = new AnsiUp();

const FooterUtils = {
  /**
   *  @param {Int}
   *  iterate value of index within the bounds of the array size
   *  @return {}
   */
  getJobStatus: (result, type, key, relayStore) => {
    /**
      *  @param {}
      *  refetches job status
      *  @return {}
      */
    const refetch = () => {
      setTimeout(() => {
        fetchStatus();
      }, 1000);
    };
    /**
      *  @param {}
      *  fetches job status for background message
      *  updates footer with a message
      *  @return {}
      */
    const fetchStatus = () => {
      const resultType = result[type];
      const resultKey = resultType ? resultType[key] : false;

      if (resultKey) {
        JobStatus.updateFooterStatus(result[type][key]).then((response) => {
          if (response.data &&
            response.data.jobStatus &&
            response.data.jobStatus.jobMetadata) {
            let fullMessage = (response.data.jobStatus.jobMetadata.indexOf('feedback') > -1) ? JSON.parse(response.data.jobStatus.jobMetadata).feedback : '';
            fullMessage = fullMessage.lastIndexOf('\n') === (fullMessage.length - 1)
              ? fullMessage.slice(0, fullMessage.length - 1)
              : fullMessage;

            const html = ansi_up.ansi_to_html(fullMessage);

            const lastIndex = (fullMessage.lastIndexOf('\n') > -1)
              ? fullMessage.lastIndexOf('\n')
              : 0;


            let message = fullMessage.slice(lastIndex, fullMessage.length);

            if (message.indexOf('[0m') > 0) {
              let res = [],
                index = 0;

              while (fullMessage.indexOf('\n', index + 1) > 0) {
                index = fullMessage.indexOf('\n', index + 1);
                res.push(index);
              }

              message = fullMessage.slice(res[res.length - 2], res[res.length - 1]);
            }

            if ((response.data.jobStatus.status === 'started' || response.data.jobStatus.status === 'finished') && store.getState().packageDependencies.refetchPending) {
              setForceRefetch(true);
              setRefetchPending(false);
            }

            if (response.data.jobStatus.status === 'started') {
              setMultiInfoMessage(response.data.jobStatus.id, message, false, false, [{ message: html }]);
              refetch();
            } else if (response.data.jobStatus.status === 'finished') {
              setMultiInfoMessage(response.data.jobStatus.id, message, true, null, [{ message: html }]);

              if ((type === 'syncLabbook') || (type === 'publishLabbook')) {

                // const userArray = JSON.parse(response.data.jobStatus.jobMetadata).labbook.split('|')

                // TODO update labbook edge/node here

              }
            } else if (response.data.jobStatus.status === 'failed') {
              setMultiInfoMessage(response.data.jobStatus.id, message, true, null, [{ message: html }]);
            } else {
              // refetch status data not ready
              refetch();
            }
          } else {
            // refetch status data not ready
            refetch();
          }
        });
      } else {
        setErrorMessage('There was an error fetching job status.', [{ message: 'Callback error from the API' }]);
      }
    };

    // trigger fetch
    fetchStatus();
  },
};

export default FooterUtils;

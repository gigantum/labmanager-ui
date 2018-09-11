//vendor
import JobStatus from 'JS/utils/JobStatus'
import store from 'JS/redux/store'
import AnsiUp from 'ansi_up';

const ansi_up = new AnsiUp();

const FooterUtils = {
  /**
   *  @param {Int}
   *  iterate value of index within the bounds of the array size
   *  @return {}
   */
  getJobStatus: (result, type, key) => {
    /**
      *  @param {}
      *  refetches job status
      *  @return {}
      */
    const refetch = () => {

      setTimeout(() => {
        fetchStatus()
      }, 1000)
    }
    /**
      *  @param {}
      *  fetches job status for background message
      *  updates footer with a message
      *  @return {}
      */
    const fetchStatus = () => {
      let resultType = result[type]
      let resultKey = resultType ? resultType[key] : false

      if(resultKey){
        JobStatus.updateFooterStatus(result[type][key]).then((response) => {

          if (response.data &&
            response.data.jobStatus &&
            response.data.jobStatus.jobMetadata &&
            (response.data.jobStatus.jobMetadata.indexOf('feedback') > -1)){

            let fullMessage = JSON.parse(response.data.jobStatus.jobMetadata).feedback
            fullMessage = fullMessage.lastIndexOf('\n') === (fullMessage.length - 1)
              ? fullMessage.slice(0, fullMessage.length - 1)
              : fullMessage

            let html = ansi_up.ansi_to_html(fullMessage);

            const lastIndex = (fullMessage.lastIndexOf('\n') > -1)
              ? fullMessage.lastIndexOf('\n')
              : 0;


            let message = fullMessage.slice(lastIndex, fullMessage.length)

            if(message.indexOf('[0m') > 0){


              let res = [],
                  index = 0;

              while ((index = fullMessage.indexOf('\n', index + 1)) > 0) {
                res.push(index);
              }

              message = fullMessage.slice(res[res.length - 2], res[res.length - 1])

            }

            if((response.data.jobStatus.status === 'started' || response.data.jobStatus.status === 'finished') && store.getState().packageDependencies.refetchPending){
              store.dispatch({
                type: 'FORCE_REFETCH',
                payload: {
                  forceRefetch: true,
                }
              })
              store.dispatch({
                type: 'SET_REFETCH_PENDING',
                payload: {
                  refetchPending: false
                }
              })
            }

            if (response.data.jobStatus.status === 'started') {

              store.dispatch({
                type: 'MULTIPART_INFO_MESSAGE',
                payload: {
                  id: response.data.jobStatus.id,
                  message: message,
                  messageBody: [{message: html}],
                  isLast: false,
                  error: false
                }
              })

              refetch()

            } else if (response.data.jobStatus.status === 'finished') {

              store.dispatch({
                type: 'MULTIPART_INFO_MESSAGE',
                payload: {
                  id: response.data.jobStatus.id,
                  message: message,
                  messageBody: [{message: html}],
                  isLast: true,

                }
              })

            } else if (response.data.jobStatus.status === 'failed') {

              store.dispatch({
                type: 'MULTIPART_INFO_MESSAGE',
                payload: {
                  id: response.data.jobStatus.id,
                  message: message,
                  messageBody: [{message: html}],
                  isLast: true,

                }
              })

            } else {
              //refetch status data not ready
              refetch()
            }

          } else {
            //refetch status data not ready
            refetch()
          }

        })
      }else{
        store.dispatch({
          type: 'ERROR_MESSAGE',
          payload: {
            message: "There was an error fetching job status.",
            messageBody: [{message: 'Callback error from the API'}],
            isLast: true,

          }
        })
      }

    }

    //trigger fetch
    fetchStatus()
  }
}

export default FooterUtils

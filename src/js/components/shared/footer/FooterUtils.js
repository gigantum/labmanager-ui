import JobStatus from 'JS/utils/JobStatus'
import store from 'JS/redux/store'

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
      }, 500)
    }
    /**
      *  @param {}
      *  fetches job status for background message
      *  updates footer with a message
      *  @return {}
      */
    const fetchStatus = () => {

      JobStatus.updateFooterStatus(result[type][key]).then((response) => {

        if (response.data && response.data.jobStatus && response.data.jobStatus.jobMetadata && response.data.jobStatus.jobMetadata.feedback) {

          let fullMessage = JSON.parse(response.data.jobStatus.jobMetadata).feedback
          fullMessage = fullMessage.lastIndexOf('\n') === (fullMessage.length - 1)
            ? fullMessage.slice(0, fullMessage.length - 1)
            : fullMessage

          const lastIndex = (fullMessage.lastIndexOf('\n') > -1)
            ? fullMessage.lastIndexOf('\n')
            : 0;
          const message = fullMessage.slice(lastIndex, fullMessage.length)

          if (response.data.jobStatus.status === 'started') {

            store.dispatch({
              type: 'MULTIPART_INFO_MESSAGE',
              payload: {
                id: response.data.jobStatus.id,
                message: message,
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
                isLast: true
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

    }

    //trigger fetch
    fetchStatus()
  }
}

export default FooterUtils

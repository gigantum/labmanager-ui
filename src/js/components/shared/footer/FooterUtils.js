import JobStatus from 'JS/utils/JobStatus'
import store from 'JS/redux/store'
import {fetchQuery} from 'JS/createRelayEnvironment';
import uuidv4 from 'uuid/v4'

 const FooterUtils = {
  getJobStatus: (result, type, key) =>{
    const fetchStatus = ()=>{

      const id = uuidv4()

      JobStatus.updateFooterStatus(result[type][key]).then((response)=>{

        if(response.data){

          let feedbackMessage = JSON.parse(response.data.jobStatus.jobMetadata).feedback
          let fullMessage =  feedbackMessage ? feedbackMessage : false;

          if(fullMessage){

            fullMessage = fullMessage.lastIndexOf('\n') === (fullMessage.length - 1) ? fullMessage.slice(0, fullMessage.length - 1) : fullMessage

            let lastIndex = fullMessage.lastIndexOf('\n') > -1 ? fullMessage.lastIndexOf('\n') : 0;
            let message = fullMessage.slice(lastIndex, fullMessage.length)

            if(response.data.jobStatus.status === 'started'){
                store.dispatch({
                  type: 'MULTIPART_INFO_MESSAGE',
                  payload: {
                    id: response.data.jobStatus.id,
                    message: message,
                    isLast: false,
                    error: false
                  }
                })
                if(store.getState().environment.refetchPending){
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
              setTimeout(()=>{
                fetchStatus()
              }, 500)

            }else if(response.data.jobStatus.status === 'finished'){

              store.dispatch({
                type: 'MULTIPART_INFO_MESSAGE',
                payload: {
                  id: response.data.jobStatus.id,
                  message: message,
                  isLast: true
                }
              })


            }else{
              setTimeout(()=>{
                fetchStatus()
              }, 500)
            }
          }else{
            setTimeout(()=>{
              fetchStatus()
            }, 500)
          }
        }else{
          setTimeout(()=>{
            fetchStatus()
          }, 500)
        }
      })
    }
    fetchStatus()

  }
}

export default FooterUtils

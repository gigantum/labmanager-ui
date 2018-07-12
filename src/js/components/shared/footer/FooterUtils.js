import JobStatus from 'JS/utils/JobStatus'
import store from 'JS/redux/store'
import {fetchQuery} from 'JS/createRelayEnvironment';
import uuidv4 from 'uuid/v4'

 const FooterUtils = {
  getJobStatus: (result, type, key) =>{
    const fetchStatus = ()=>{
      console.log('fetch fired')
      const id = uuidv4()
      console.log(result)
      JobStatus.updateFooterStatus(result[type][key]).then((response)=>{
        console.log(response)
        if(response.data){
          let feedbackMessage = JSON.parse(response.data.jobStatus.jobMetadata).feedback
          let fullMessage =  feedbackMessage ? feedbackMessage : 'Preparing to Unzip';

          if(fullMessage ){
             fullMessage = fullMessage.lastIndexOf('\n') === (fullMessage.length - 1) ? fullMessage.slice(0, fullMessage.length - 2) : fullMessage

            let lastIndex = fullMessage.lastIndexOf('\n') > -1 ? fullMessage.lastIndexOf('\n') : 0;
            let message =   fullMessage.slice(lastIndex, fullMessage.length)

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
              setTimeout(()=>{
                fetchStatus()
              }, 500)

            }else if(response.data.jobStatus.status === 'finished'){
              console.log(message)
              store.dispatch({
                type: 'MULTIPART_INFO_MESSAGE',
                payload: {
                  id: response.data.jobStatus.id,
                  message: message,
                  isLast: true
                }
              })
              setTimeout(()=>{
                store.dispatch({
                  type: 'MULTIPART_INFO_MESSAGE',
                  payload: {
                    id: response.data.jobStatus.id,
                    message: '',
                    isLast: true
                  }
                })
              },3000)

            }else{
              store.dispatch({
                type: '',
                payload: {
                  id: response.data.jobStatus.id,
                  message: message,
                  isLast: true,
                  error: false
                }
              })
            }
          }
        }
      })
    }
    fetchStatus()

  }
}

export default FooterUtils

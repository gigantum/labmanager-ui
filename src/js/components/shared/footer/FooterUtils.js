import JobStatus from 'JS/utils/JobStatus'
import store from 'JS/redux/store'
import {fetchQuery} from 'JS/createRelayEnvironment';
import uuidv4 from 'uuid/v4'

 const FooterUtils = {
  getJobStatus: (result) =>{
    const fetchStatus = ()=>{
      const id = uuidv4()

      JobStatus.updateFooterStatus(result.buildImage.backgroundJobKey).then((response)=>{

        let fullMessage =  JSON.parse(response.data.jobStatus.jobMetadata).feedback

        if(fullMessage){
           fullMessage = fullMessage.slice(0, fullMessage.length - 2)

          let lastIndex = fullMessage.lastIndexOf('\n') > -1 ? fullMessage.lastIndexOf('\n') : 0;
          let message = fullMessage.slice(fullMessage.lastIndexOf('\n'), fullMessage.length - 1)

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
            }, 250)

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
      })
    }
    fetchStatus()

  }
}

export default FooterUtils

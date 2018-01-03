//vendor
import {
  graphql,
} from 'react-relay'
//environment
import {fetchQuery} from 'JS/createRelayEnvironment';

const jobStatusQuery = graphql`
  query JobStatusQuery($jobKey: String!){
    jobStatus(jobId: $jobKey){
      id,
      jobKey
      status
      startedAt
      finishedAt
      result
    }
  }
`;


const JobStatus = {
  getJobStatus: (jobKey) =>{
      const variables = {jobKey: jobKey};

    return new Promise((resolve, reject) =>{

      let fetchData = function(){

        fetchQuery(jobStatusQuery(), variables).then((response) => {
        //debugger;
          if(response.data.jobStatus.status === 'started'){
            setTimeout(()=>{
              fetchData()
            }, 250)

          }else if(response.data.jobStatus.status === 'finished'){

            resolve(response.data)
          }else{
            reject(response.data)
          }
        }).catch((error) =>{
          console.log(error)
          reject(error)
        })
      }

      fetchData()
    })
  }
}

export default JobStatus

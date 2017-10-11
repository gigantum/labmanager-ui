//vendor
import {
  graphql,
} from 'react-relay'
//environment
import environment from 'JS/createRelayEnvironment';

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
        environment._network.fetch(jobStatusQuery(), variables).then((response) => {
      
          if(response.data.jobStatus.status === 'started'){
            fetchData()
          }else{
            resolve(response.data)
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

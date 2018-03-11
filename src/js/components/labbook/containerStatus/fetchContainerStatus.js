//vendor
import {
  graphql,
} from 'react-relay'
//environment
import {fetchQuery} from 'JS/createRelayEnvironment';

const containerStatusQuery = graphql`
  query fetchContainerStatusQuery($name: String!, $owner: String!, $first: Int!){
  labbook(name: $name, owner: $owner){
    environment{
      containerStatus
      imageStatus
    }
    activityRecords(first: $first){
      edges{
        node{
          id
        }
      }
    }
  }
}
`

const FetchContainerStatus = {
  getContainerStatus: (owner, labbookName) =>{
    const variables = {
      'owner': owner,
      'name': labbookName,
      'first': Math.floor(Math.random() * 10000)
      }

    return new Promise((resolve, reject) =>{

      let fetchData = function(){

        fetchQuery(containerStatusQuery(), variables).then((response) => {

          resolve(response.data)

        }).catch((error) =>{
          console.log(error)
          reject(error)
        })
      }

      fetchData()
    })
  }
}

export default FetchContainerStatus

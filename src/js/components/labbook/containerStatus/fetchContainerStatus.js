//vendor
import {
  graphql,
} from 'react-relay'
//environment
import {fetchQuery} from 'JS/createRelayEnvironment';

const containerStatusQuery = graphql`
  query fetchContainerStatusQuery($name: String!, $owner: String!){
  labbook(name: $name, owner: $owner){
    environment{
      containerStatus
      imageStatus
    }
  }
}
`

const FetchContainerStatus = {
  getContainerStatus: (owner, labbookName) =>{
    const variables = {
      'owner': owner,
      'name': labbookName,
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

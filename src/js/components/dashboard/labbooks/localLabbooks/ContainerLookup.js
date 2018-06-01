//vendor
import {
  graphql,
} from 'react-relay'
//environment
import {fetchQuery} from 'JS/createRelayEnvironment';


const ContainerLookupQuery = graphql`
  query ContainerLookupQuery($ids: [String]!){
    labbookList{
      localById(ids: $ids){
        environment{
          id
          imageStatus
          containerStatus
        }
      }
    }
  }
`;

// const ContainerLookupQuery = graphql`
//   query ContainerLookupQuery($owner: String!, $name: String!, $manager: String!, $package: String!, $version: String){
    // labbook(owner: $owner, name: $name){
    //   package(manager: $manager, package: $package, version: $version){
    //     id,
    //     schema
    //     manager
    //     package
    //     version
    //     latestVersion
    //     fromBase
    //   }
    // }
//   }
// `;


const ContainerLookup = {
  query: (ids) =>{
    const variables = {ids};

    return new Promise((resolve, reject) =>{

      let fetchData = function(){

        fetchQuery(ContainerLookupQuery(), variables).then((response) => {
          resolve(response)
        }).catch((error) =>{
          console.log(error)
          reject(error)
        })
      }

      fetchData()
    })
  }
}

export default ContainerLookup

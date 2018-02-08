//vendor
import {
  graphql,
} from 'react-relay'
//environment
import {fetchQuery} from 'JS/createRelayEnvironment';

const PackageLookupQuery = graphql`
  query PackageLookupQuery($manager: String!, $package: String!, $version: String){
    package(manager: $manager, package: $package, version: $version){
      id,
      schema
      manager
      package
      version
      latestVersion
      fromBase
    }
  }
`;


const PackageLookup = {
  query: (manager, packageName, version ) =>{

    version = version === '' ? null : version;
    const variables = {manager: manager, package: packageName, version: version};

    return new Promise((resolve, reject) =>{

      let fetchData = function(){

        fetchQuery(PackageLookupQuery(), variables).then((response) => {
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

export default PackageLookup

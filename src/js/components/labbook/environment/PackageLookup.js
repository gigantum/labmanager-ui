//vendor
import {
  graphql,
} from 'react-relay'
//environment
import {fetchQuery} from 'JS/createRelayEnvironment';

const PackageLookupQuery = graphql`
  query PackageLookupQuery($owner: String!, $name: String!, $manager: String!, $package: String!, $version: String){
    labbook(owner: $owner, name: $name){
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
  }
`;


const PackageLookup = {
  query: (name, owner, manager, packageName, version ) =>{

    version = version === '' ? null : version;
    const variables = {name, owner, manager, package: packageName, version};

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

//vendor
import {
  graphql,
} from 'react-relay'
//environment
import {fetchQuery} from 'JS/createRelayEnvironment';

const PackageLookupQuery = graphql`
  query PackageLookupQuery($owner: String!, $name: String!, $input: [PackageComponentInput]!){
    labbook(owner: $owner, name: $name){
      packages(packageInput: $input){
        id,
        schema
        manager
        package
        version
        latestVersion
        fromBase
        isValid
      }
    }
  }
`;


const PackageLookup = {
  query: (name, owner, input ) =>{

    const variables = {name, owner, input};

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

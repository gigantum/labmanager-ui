//vendor
import {
  graphql,
} from 'react-relay'
//environment
import {fetchQuery} from 'JS/createRelayEnvironment';


const PublicVisibilityLookupQuery = graphql`
  query PublicVisibilityLookupQuery($ids: [String]!){
    labbookList{
      localById(ids: $ids){
        publicVisibility
      }
    }
  }
`;

const PublicVisibility = {
  query: (ids) =>{
    const variables = {ids};

    return new Promise((resolve, reject) =>{

      let fetchData = function(){

        fetchQuery(PublicVisibilityLookupQuery(), variables).then((response) => {
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

export default PublicVisibility

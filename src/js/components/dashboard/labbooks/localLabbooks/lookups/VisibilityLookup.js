//vendor
import {
  graphql,
} from 'react-relay'
//environment
import {fetchQuery} from 'JS/createRelayEnvironment';


const VisibilityLookupQuery = graphql`
  query VisibilityLookupQuery($ids: [String]!){
    labbookList{
      localById(ids: $ids){
        visibility
      }
    }
  }
`;

const Visibility = {
  constructor(){
  	this.query = this.query;
  },

  query: (ids) =>{

    const variables = {ids};

    return new Promise((resolve, reject) =>{

      let fetchData = function(){

        fetchQuery(VisibilityLookupQuery(), variables).then((response) => {
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

export default Visibility

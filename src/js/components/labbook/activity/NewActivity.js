// vendor
import { graphql } from 'react-relay';
// environment
import { fetchQuery } from 'JS/createRelayEnvironment';


const activityFetchQuery = graphql`
 query NewActivityQuery($name: String!, $owner: String!, $first: Int!){
   labbook(name: $name, owner: $owner){
     activityRecords(first: $first){
       edges{
         node{
           id
           commit
         }
       }
     }
   }
 }`;

const NewActivity = {
  getNewActivity: (name, owner) => {
    const variables = {
      name,
      owner,
      first: 1,
    };

    return new Promise((resolve, reject) => {
      fetchQuery(activityFetchQuery(), variables).then((response, error) => {
        resolve(response);
      }).catch((error) => {
        console.log(error);
        reject(error);
      });
    });
  },
};

export default NewActivity;

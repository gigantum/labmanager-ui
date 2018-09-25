// vendor
import { graphql } from 'react-relay';
// environment
import { fetchQuery } from 'JS/createRelayEnvironment';

const containerStatusQuery = graphql`
  query fetchLabbookQuery($name: String!, $owner: String!, $first: Int!, $hasNext: Boolean!, $cursor: String){
  labbook(name: $name, owner: $owner){
    id
    description
    ...Labbook_labbook
  }
}
`;

const FetchLabbook = {
  getLabook: (owner, labbookName) => {
    const variables = {
      owner,
      name: labbookName,
      first: 2,
      cursor: null,
      hasNext: false,
    };

    return new Promise((resolve, reject) => {
      const fetchData = function () {
        fetchQuery(containerStatusQuery(), variables).then((response) => {
          resolve(response.data);
        }).catch((error) => {
          console.log(error);
          reject(error);
        });
      };

      fetchData();
    });
  },
};

export default FetchLabbook;

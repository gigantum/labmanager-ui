// vendor
import { graphql } from 'react-relay';
// mutations
import RemoveUserIdentityMutation from 'Mutations/RemoveUserIdentityMutation';
// environment
import { fetchQuery } from 'JS/createRelayEnvironment';

const userIdentityQuery = graphql`
  query UserIdentityQuery{
    userIdentity{
      id
      username
      email
      givenName
      familyName
      isSessionValid
    }
  }
`;

const UserIdentity = {
  getUserIdentity: () => new Promise((resolve, reject) => {
    const fetchData = function () {
      fetchQuery(userIdentityQuery(), {}).then((response, error) => {
        if (response) {
          resolve(response);
        } else {
          reject(response);
        }
      }).catch((error) => {
        reject(error);
      });
    };

    fetchData();
  }),
  removeUserIdentity: () => {
    RemoveUserIdentityMutation(() => {
      console.log('removed user');
    });
  },

};

export default UserIdentity;

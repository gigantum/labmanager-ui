import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from '../createRelayEnvironment'
import {ConnectionHandler} from 'relay-runtime'
//
// const mutation = graphql`
//   mutation CreateLabbookMutation($input: CreateLabbookInput!) {
//     createLabbook(input: $input) {
//       labbook {
//         id
//         name
//         description
//       }
//     }
//   }
// `;

const mutation = graphql`
  mutation CreateLabbookMutation($input: CreateLabbookInput!){
    createLabbook(input: $input){
      labbook{
        id
      }
    }
  }
`;

let tempID = 0;

export default function CreateLabbookMutation(description, name, viewerId, callback) {
  const variables = {
    input: {
      description,
      name,
      clientMutationId: ""
    }
  }
  commitMutation(
    environment,
    {
      mutation,
      variables,
      onCompleted: (response) => {
        console.log(response, environment)
        callback()
      },
      onError: err => console.error(err),
      optimisticUpdater: (proxyStore) => {
        // 1 - create the `newPost` as a mock that can be added to the store
        const id = viewerId
        const newPost = proxyStore.create(id, 'Post')
        newPost.setValue(name, 'name')
        newPost.setValue(description, 'description')
        // 2 - add `newPost` to the store
        const viewerProxy = proxyStore.get(viewerId)
        const connection = ConnectionHandler.getConnection(viewerProxy, 'LabbookSets_localLabbooks')
        if (connection) {
          ConnectionHandler.insertEdgeAfter(connection, newPost)
        }
      },
      updater: (proxyStore) => {
        console.log(proxyStore)
        // 1 - retrieve the `newPost` from the server response

        const createPostField = proxyStore.getRootField('createLabbook')
        //const newPost = createPostField.getLinkedRecord('post')

        // 2 - add `newPost` to the store
        const viewerProxy = proxyStore.get("client:root")

        const connection = ConnectionHandler.getConnection(viewerProxy, 'LabbookSets_localLabbooks')
        if (connection) {
          //ConnectionHandler.insertEdgeAfter(connection, newPost)
        }
      },
    },
  )
}

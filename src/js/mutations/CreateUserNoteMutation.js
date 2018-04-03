import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'

const mutation = graphql`
  mutation CreateUserNoteMutation($input: CreateUserNoteInput!){
    createUserNote(input: $input){
      clientMutationId
      newActivityRecordEdge{
        node{
          id
          linkedCommit
          commit
          tags
          type
          show
          message
          importance
          detailObjects{
            id
            key
            data
            type
            show
            importance
            tags
          }
        }
        cursor
      }
    }
  }
`;

let tempID = 0;

export default function CreateUserNoteMutation(
  labbookName,
  title,
  body,
  owner,
  objects,
  tags,
  labbookId,
  callback
) {

  const variables = {
    input: {
      labbookName,
      title,
      body,
      owner,
      tags,
      clientMutationId: tempID++
    }
  }
  commitMutation(
    environment,
    {
      mutation,
      variables,
      configs: [{ //commented out until nodes are returned
        type: 'RANGE_ADD',
        parentID: labbookId,
        connectionInfo: [{
          key: 'Activity_activityRecords',
          rangeBehavior: 'prepend'
        }],
        edgeName: 'newActivityRecordEdge'
      }],
      onCompleted: (response, error) => {

        if(error){
          console.log(error)
        }

        callback(response, error)
      },
      onError: err => console.error(err)
    }
  )
}

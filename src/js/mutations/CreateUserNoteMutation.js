import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'
import RelayRuntime from 'relay-runtime'

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
      onError: err => console.error(err),

      updater: (store, response) => {

        const id = 'client:newActivity:'+ tempID++;
        const node = store.create(id, 'Note')

          console.log(response)

          node.setValue(labbookName, 'labbookName')
          node.setValue(title, 'message')

          console.log(node)
          //node.setValue(response.createUserNote.newActivityRecordEdge.detailObjects, 'detailObjects')
          node.setValue(JSON.stringify(tags), 'tags')
          node.setValue(owner, 'owner')
          node.setValue('USER_NOTE', 'level')
          node.setValue('new', 'commit')
          node.setValue('new', 'timestamp')

         const activityProxy = store.get(labbookId);
         const conn = RelayRuntime.ConnectionHandler.getConnection(
           activityProxy,
           'Activity_activityRecords',
         );
         console.log(conn)
         if(conn){

           const newEdge = RelayRuntime.ConnectionHandler.createEdge(
             store,
             conn,
             node,
             "newActivityRecordEdge"
           )
           //RelayRuntime.ConnectionHandler.insertEdgeBefore(conn, newEdge)
        }
      },
    },
  )
}

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
      note{
        linkedCommit
        commit
        level
        tags
        timestamp
        freeText
        message
        id
        author
      }
    }
  }
`;

let tempID = 0;

export default function CreateUserNoteMutation(
  labbookName,
  message,
  freeText,
  owner,
  objects,
  tags,
  labbookId,
  callback
) {

  const variables = {
    input: {
      labbookName,
      message,
      freeText,
      owner,
      objects,
      tags,
      clientMutationId: tempID++
    }
  }
  commitMutation(
    environment,
    {
      mutation,
      variables,
      // configs: [{ //commented out until nodes are returned
      //   type: 'RANGE_ADD',
      //   parentID: labbookId,
      //   connectionInfo: [{
      //     key: 'Notes_notes',
      //     rangeBehavior: 'prepend'
      //   }],
      //   edgeName: 'note'
      // }],
      onCompleted: (response, error) => {

        if(error){
          console.log(error)
        }

        callback(response, error)
      },
      onError: err => console.error(err),

      updater: (store) => {

        const id = 'client:newNote:'+ tempID++;
        const node = store.create(id, 'Note')

          node.setValue(labbookName, 'labbookName')
          node.setValue(message, 'message')
          node.setValue(freeText, 'freeText')
          node.setValue(JSON.stringify(tags), 'tags')
          node.setValue(owner, 'owner')
          node.setValue('USER_NOTE', 'level')
          node.setValue('new', 'commit')

         const notesProxy = store.get(labbookId);
         const conn = RelayRuntime.ConnectionHandler.getConnection(
           notesProxy,
           'Notes_notes',
         );

         if(conn){
           const newEdge = RelayRuntime.ConnectionHandler.createEdge(
             store,
             conn,
             node,
             "noteEdge"
           )
           RelayRuntime.ConnectionHandler.insertEdgeBefore(conn, newEdge)
        }
      },
    },
  )
}

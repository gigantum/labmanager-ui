import {
  commitMutation,
  graphql,
} from 'react-relay'
import environment from 'JS/createRelayEnvironment'
import RelayRuntime from 'relay-runtime'

const mutation = graphql`
  mutation AddCustomComponentMutation($input: AddCustomComponentInput!){
    addCustomComponent(input: $input){
      newCustomComponentEdge{
        node{
          id
          schema
          repository
          componentId
          revision
          name
          description
          tags
          license
          osBaseClass
          url
          requiredPackageManagers
          dockerSnippet
        }
        cursor
      }
      clientMutationId
    }
  }
`;

let tempID = 0;


/**
  @param {object, string, object} store,id,newEdge
  gets a connection to the store and insets an edge if connection is Successful
*/
function sharedUpdater(store, id, newEdge) {
  const userProxy = store.get(id);
  const conn = RelayRuntime.ConnectionHandler.getConnection(
    userProxy,
    'CustomDependencies_customDependencies'
  );

  if(conn){
    RelayRuntime.ConnectionHandler.insertEdgeAfter(conn, newEdge);
  }

}


export default function AddEnvironmentPackageMutation(
  owner,
  labbookName,
  repository,
  componentId,
  revision,
  environmentId,
  clientMutationId,
  callback
) {
  const variables = {
    input: {
      labbookName,
      owner,
      repository,
      revision,
      componentId,
      clientMutationId:  tempID++
    }
  }
  commitMutation(
    environment,
    {
      mutation,
      variables,
      onCompleted: (response, error) => {
        if(error){
          console.log(error)
        }
        callback(response, error)
      },
      onError: err => console.error(err),

      updater: (store, response) => {

        if(response){
          //TODO use edge from linked record
          const id = 'client:PackageManagerDependencies:' + tempID++;
          const node = store.create(id, 'customPackage');
          const {
            componentId,
            description,
            dockerSnippet,
            license,
            name,
            osBaseClass,
            repository,
            requiredPackageManagers,
            revision,
            schema,
            tags,
            url
          } = response.addCustomComponent.newCustomComponentEdge.node


          node.setValue(componentId, 'componentId')
          node.setValue(description, 'description')
          node.setValue(dockerSnippet, 'dockerSnippet')
          node.setValue(name, 'name')
          node.setValue(license, 'license')
          node.setValue(osBaseClass, 'osBaseClass')
          node.setValue(repository, 'repository')
          node.setValue(requiredPackageManagers, 'requiredPackageManagers')
          node.setValue(revision, 'revision')
          node.setValue(schema, 'schema')
          node.setValue(tags, 'tags')
          node.setValue(url, 'url')


          const newEdge = store.create(
            'client:newEdge:' + tempID,
            'PackageManagerEdge',
          );

          newEdge.setLinkedRecord(node, 'node');

          sharedUpdater(store, environmentId, newEdge);
        }
      },
      optimisticUpdater: (store) => {


        const id = 'client:newPackageManager:' + tempID++;
        const node = store.create(id, 'PackageManager');

        node.setValue(revision, 'revision')
        node.setValue(componentId, 'componentId')
        node.setValue(repository, 'repository')
        node.setValue(labbookName, 'labbookName')
        node.setValue(owner, 'owner')
        node.setValue(componentId, 'name')
        const newEdge = store.create(
          'client:newEdge:' + tempID,
          'PackageManagerEdge',
        );

        newEdge.setLinkedRecord(node, 'node');

        sharedUpdater(store, environmentId, newEdge);


      },
    },
  )
}

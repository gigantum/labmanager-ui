//vendor
import fs from 'fs'
import os from 'os'
//mutations
import AddPackageComponentsMutation from 'Mutations/environment/AddPackageComponentsMutation';
import RemovePackageComponentsMutation from 'Mutations/environment/RemovePackageComponentsMutation';
import AddCustomComponentMutation from 'Mutations/environment/AddCustomComponentMutation';
import RemoveCustomComponentMutation from 'Mutations/environment/RemoveCustomComponentMutation';
//config
import testConfig from './config'

let owner = JSON.parse(fs.readFileSync(os.homedir() + testConfig.ownerLocation, 'utf8')).username

const {
  manager,
  packageName,
  packageVersion,
  packageConnection,
  skipValidation,
  repository,
  revision,
  customComponentId,
  customConnection

} = testConfig;

const PackageComponents = {

  addPackageComponent: (labbbookName, clientMutationId, environmentId, callback) => {
    AddPackageComponentsMutation(
      labbbookName,
      owner,
      manager,
      packageName,
      packageVersion,
      clientMutationId,
      environmentId,
      packageConnection,
      skipValidation,
      callback
    )
  },
  removePackageComponent: (labbbookName, nodeId, environmentId, callback) => {
    RemovePackageComponentsMutation(
      labbbookName,
      owner,
      manager,
      packageName,
      nodeId,
      '',
      environmentId,
      packageConnection,
      callback
    )
  },
  addCustomComponent: (labbbookName, environmentId, callback) => {
    AddCustomComponentMutation(
      owner,
      labbbookName,
      repository,
      customComponentId,
      0,
      environmentId,
      '',
      callback,
    )
  },
  removeCustomComponent: (labbbookName, nodeId, environmentId, callback) => {
    RemoveCustomComponentMutation(
      labbbookName,
      owner,
      repository,
      customComponentId,
      nodeId,
      '',
      environmentId,
      customConnection,
      callback,
    )
  }

}

export default PackageComponents;

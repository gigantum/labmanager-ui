//vendor
import uuidv4 from 'uuid/v4'
import fs from 'fs'
import os from 'os'
// mutations
import DeleteLabbook from './../deleteLabbook';
import CreateLabbook from './../createLabbook';
import PackageComponents from './../packageComponents';
import StartContainer from './../startContainer';
import StopContainer from './../stopContainer';
import BuildImage from './../buildImage';
import FetchContainerStatus from 'Components/labbook/containerStatus/fetchContainerStatus'
//config
import testConfig from './../config'
//utils
import LabbookQuery from './../labbookQuery'

let owner = JSON.parse(fs.readFileSync(os.homedir() + testConfig.ownerLocation, 'utf8')).username

const labbookName = uuidv4()

describe('Test Suite: Add remove components', () => {

  test('Test: CreateLabbookMuation - Create Labbook Mutation untracked', done => {
    const isUntracked = true;

    CreateLabbook.createLabbook(
      labbookName,
      isUntracked,
      (response, error) => {

        if (response) {

          expect(response.createLabbook.labbook.name).toEqual(labbookName);

          done()

        } else {

          done.fail(new Error(error))
        }

      }
    )
  })

  test('setup relay store', done => {
    let variables = {
      owner,
      name: labbookName,
      hasNext: false,
      first: 2,
    }
    LabbookQuery(variables, (error, props) => {
      done();
    })
  })

  let environmentId;

  test('Test: AddPackageComponentMutation - Add Package (error)', done => {
    const clientMutationId = '0'
    PackageComponents.addPackageComponent(
      'invalid',
      clientMutationId,
      environmentId,
      (response, error) => {
        if (error) {
          expect(error).toBeTruthy();
          done()
        } else {
          done.fail();
        }
      }
    )
  })

  test('Test: AddCustomComponentMutation - Add Custom Package (error)', done => {
    PackageComponents.addCustomComponent(
      'invalid',
      environmentId,
      (response, error) => {
        if (error) {
          expect(error).toBeTruthy();
          done()
        } else {
          done.fail();
        }
      }
    )
  })


  test('Test: BuildImageMutation - Build Image', done => {
    const noCache = true;

    BuildImage.buildImage(
      labbookName,
      noCache,
      (response, error) => {
        if (response) {
          expect(response.buildImage.clientMutationId).toEqual('0');

          done()

        } else {
          done.fail(new Error(error))
        }

      }
    )

  })

  let nodeId;
  test('Test: AddPackageComponentMutation - Add Package', done => {
    const fetchStatus = () => {
      FetchContainerStatus.getContainerStatus(owner, labbookName).then((response, error) => {
        environmentId = response.labbook.environment.id;
        if (response.labbook.environment.imageStatus === "EXISTS") {
          const clientMutationId = '0'
          PackageComponents.addPackageComponent(
            labbookName,
            clientMutationId,
            environmentId,
            (response, error) => {
              nodeId = response.addPackageComponent.newPackageComponentEdge.node.id;
              if (response) {
                expect(response.addPackageComponent).toBeTruthy();
                done()
              } else {
                done.fail(new Error(error))
              }

            }
          )

        }
        setTimeout(() => {
          fetchStatus()
        }, 3 * 1000)
      })
    }
    fetchStatus();
  })

  test('Test: RemovePackageComponentMutation - Remove Package', done => {
    PackageComponents.removePackageComponent(
      labbookName,
      nodeId,
      environmentId,
      (response, error) => {
        if (response) {
          expect(response.removePackageComponent.success).toEqual(true);
          done()
        } else {
          done.fail(new Error(error))
        }

      }
    )
  })

  test('Test: RemovePackageComponentMutation - Remove Package (error)', done => {
    PackageComponents.removePackageComponent(
      labbookName,
      nodeId,
      environmentId,
      (response, error) => {
        if (error) {
          expect(error).toBeTruthy();
          done()
        } else {
          done.fail();
        }

      }
    )
  })
  test('Test: AddCustomComponentMutation - Add Custom Package', done => {
    PackageComponents.addCustomComponent(
      labbookName,
      environmentId,
      (response, error) => {
        if (response) {
          nodeId = response.addCustomComponent.newCustomComponentEdge.node.id;
          expect(response.addCustomComponent).toBeTruthy();
          done()
        } else {
          done.fail(new Error(error))
        }

      }
    )
  })

  test('Test: RemoveCustomComponentMutation - Remove Custom Package', done => {
    PackageComponents.removeCustomComponent(
      labbookName,
      nodeId,
      environmentId,
      (response, error) => {
        if (response) {
          expect(response.removeCustomComponent.success).toEqual(true);
          done()
        } else {
          done.fail(new Error(error))
        }

      }
    )
  })

  test('Test: RemoveCustomComponentMutation - Remove Custom Package (error)', done => {
    PackageComponents.removeCustomComponent(
      labbookName,
      nodeId,
      environmentId,
      (response, error) => {
        if (error) {
          expect(error).toBeTruthy();
          done()
        } else {
          done.fail();
        }

      }
    )
  })



  test('Test: DeleteLabbookMutation - Delete Labbook Mutation confirm', done => {

    const confirm = true

    DeleteLabbook.deleteLabbook(
      labbookName,
      confirm,
      (response, error) => {

        if (response) {

          expect(response.deleteLabbook.success).toEqual(true);

          done()

        } else {

          done.fail(new Error(error))

        }
      }
    )

  })

})

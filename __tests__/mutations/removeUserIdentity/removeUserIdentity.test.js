//vendor
import fs from 'fs';
import os from 'os'
// mutations
import RemoveUserIdentity from './../removeUserIdentity';

describe('Test Suite: Remove User Identitiy', () => {

  let userIdentity = fs.readFileSync(os.homedir() + '/gigantum/.labmanager/identity/user.json', 'utf8')

  test('Test: RemoveUserIdentityMutation - Remove User Identity', done => {
    RemoveUserIdentity.removeUserIdentity(
        (response, error) => {
          console.log(response, error)
          if(response){
            expect(response.removeUserIdentity.clientMutationId).toEqual('0');
            done()
          }else{
            done.fail(new Error(error))
          }
        }
    )
  })

  test('Add file back', done => {
    fs.writeFileSync(os.homedir() + '/gigantum/.labmanager/identity/user.json', userIdentity)
    done();
  })
})

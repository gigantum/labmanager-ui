
import CreateLabbookMutation, {mutation} from 'Mutations/createLabbookMutation';
import {
  testData
} from './createLabbookMutation.config.js'
import commitMutation from 'react-relay'

//jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
// //
// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'; // Ignore 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' authorization error
//
// // Issue the request
// request(
// {
//     method: "GET",
//     uri: "http://127.0.0.1:10000",
//     proxy: "http://127.0.0.1:8888" // Note the fully-qualified path to Fiddler proxy. No "https" is required, even for https connections to outside.
// },
// function(err, response, body) {
//     console.log("done");
// });


process.on('unhandledRejection', (reason) => { console.log('REJECTION', reason) })
test('Test Create Labbook Mutation untracked', done => {
  const isUntracked = true;

  CreateLabbookMutation(
      testData.name,
      testData.description,
      testData.repository,
      testData.componentId,
      testData.revision,
      isUntracked,
      (response, error) => {

        if(response){
          console.log(response)
          expect(response.createLabbook.labbook.name).toEqual(testData.name);
          done()
        }else{
          console.log(error)
          done.fail(new Error(error))
        }


      }
  )

})

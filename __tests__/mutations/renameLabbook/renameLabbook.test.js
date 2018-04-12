// //vendor
// import uuidv4 from 'uuid/v4'
// // mutations
// import DeleteLabbook from './../deleteLabbook';
// import CreateLabbook from './../createLabbook';
// import RenameLabbook from './../renameLabbook';

// const labbookName = uuidv4()
// const newLabbookName = uuidv4()

// describe('Test Suite: Rename Labbook', () => {

//   test('Test: CreateLabbookMuation - Create Labbook Mutation untracked', done => {
//     const isUntracked = true;

//     CreateLabbook.createLabbook(
//         labbookName,
//         isUntracked,
//         (response, error) => {

//           if(response){

//             expect(response.createLabbook.labbook.name).toEqual(labbookName);

//             done()

//           }else{

//             done.fail(new Error(error))
//           }

//         }
//     )

//   })

//   test('Test: RenameLabbookMutation - Rename Labbook', done => {

//     RenameLabbook.renameLabbook(
//         labbookName,
//         newLabbookName,
//         (response, error) => {
//           console.log(response, error)
//           done();
//           if(response){

//             expect(response.renameLabbook).toBeTruthy();

//             done()

//           }else{

//             done.fail(new Error(error))
//           }

//         }
//     )

//   })

//   // test('Test: RenameLabbookMutation - Rename Labbook (error)', done => {

//   //   RenameLabbook.renameLabbook(
//   //       'invalid',
//   //       (response, error) => {
//   //         if(error){
//   //           expect(error).toBeTruthy();
//   //           done()
//   //         } else{
//   //           done.fail();
//   //         }
//   //       }
//   //   )

//   // })



//   test('Test: DeleteLabbookMutation - Delete Labbook Mutation confirm', done => {

//     const confirm = true

//     DeleteLabbook.deleteLabbook(
//         newLabbookName,
//         confirm,
//         (response, error) => {

//           if(response){

//             expect(response.deleteLabbook.success).toEqual(true);

//             done()

//           }else{

//             done.fail(new Error(error))

//           }
//         }
//     )

//   })

// })

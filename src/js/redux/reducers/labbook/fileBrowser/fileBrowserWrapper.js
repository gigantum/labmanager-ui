/**
 * constants
 */
export const FINISHED_UPLOADING = 'FINISHED_UPLOADING';
export const STARTED_UPLOADING = 'STARTED_UPLOADING';




export default (
 state = {
   uploading: false
 },
 action
) => {
 if (action.type === STARTED_UPLOADING) {
   return {
     ...state,
     uploading: true
   };
 }else if(action.type === FINISHED_UPLOADING){
   return {
     ...state,
     uploading: false
   };
 }

 return state;
};

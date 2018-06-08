/**
 * constants
 */
export const FINISHED_UPLOADING = 'FINISHED_UPLOADING';
export const STARTED_UPLOADING = 'STARTED_UPLOADING';
export const PAUSE_UPLOAD = 'PAUSE_UPLOAD'
export const PAUSE_UPLOAD_DATA= 'PAUSE_UPLOAD_DATA'


export default (
 state = {
   uploading: false,
   pauseUpload: false,
   pauseUploadModalOpen: false,
   files: [],
   count: 0
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
 }else if(action.type === PAUSE_UPLOAD){
   return {
     ...state,
     pauseUpload: action.payload.pauseUpload
   };
 }else if(action.type === PAUSE_UPLOAD_DATA){
   return {
     ...state,
     files: action.payload.files,
     count: action.payload.count
   };
 }

 return state;
};

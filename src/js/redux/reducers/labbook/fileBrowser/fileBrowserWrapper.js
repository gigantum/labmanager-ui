/**
 * constants
 */
export const FINISHED_UPLOADING = 'FINISHED_UPLOADING';
export const STARTED_UPLOADING = 'STARTED_UPLOADING';
export const PAUSE_UPLOAD = 'PAUSE_UPLOAD'
export const PAUSE_UPLOAD_DATA= 'PAUSE_UPLOAD_DATA'
export const PAUSE_CHUNK_UPLOAD = 'PAUSE_CHUNK_UPLOAD'
export const RESET_CHUNK_UPLOAD = 'RESET_CHUNK_UPLOAD'

export default (
 state = {
   uploading: false,
   pause: false,
   pauseUploadModalOpen: false,
   files: [],
   count: 0,
   transactionId: '',
   prefix: '',
   totalFiles: 0,
   chunkUploadData: {}
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
     pause: action.payload.pause
   };
 }else if(action.type === PAUSE_UPLOAD_DATA){
   return {
     ...state,
     files: action.payload.files,
     count: action.payload.count,
     transactionId: action.payload.transactionId,
     prefix: action.payload.prefix,
     totalFiles: action.payload.totalFiles
   };
 }else if(action.type === PAUSE_CHUNK_UPLOAD){

   const {
     data,
     chunkData,
     section,
     username
   } = action.payload

   const chunkUploadData = {
     data,
     chunkData,
     section,
     username
   }
   return {
     ...state,
     chunkUploadData
   };
 }else if(action.type === RESET_CHUNK_UPLOAD){

   return {
     ...state,
     chunkUploadData: {}
   };
 }

 return state;
};

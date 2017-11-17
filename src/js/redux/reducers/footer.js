/**
 * constants
 */
export const UPLOAD_ERROR = 'UPLOAD_ERROR';
export const LOADING_PROGRESS = 'LOADING_PROGRESS';
export const UPLOAD_MESSAGE = 'UPLOAD_MESSAGE';
export const RESET_FOOTER_STORE = 'RESET_FOOTER_STORE';
export const IMPORT_SUCCESS = 'IMPORT_SUCCESS';
export const BATCH_LOADING_PROGRESS = 'BATCH_LOADING_PROGRESS'
export default (
 state = {
   bytesUploaded: 0,
   totalBytes: 0,
   percentage: 0,
   loadingState: false,
   uploadMessage: '',
   error: false,
   success: false,
   labbookname: '',
   index: 0,

 },
 action
) => {
 if (action.type === UPLOAD_ERROR) {
   return {
     ...state,
     error: action.payload.error
   };
 } else if (action.type === LOADING_PROGRESS) {
   return {
     ...state,
     bytesUploaded: action.payload.bytesUploaded,
     percentage: action.payload.percentage,
     totalBytes:  action.payload.totalBytes,
     loadingState: action.payload.loadingState,
     uploadMessage: '',
     labbookName: '',
     error: false,
     success: false,
     index:  0,
     totalFiles:  0,

   };
 } else if (action.type === BATCH_LOADING_PROGRESS) {
   console.trace(action)
    return {
      ...state,
      index:  action.payload.index,
      totalFiles:  action.payload.totalFiles,
      percentage: 0,
      totalBytes:  0,
      loadingState: action.payload.loadingState,
      uploadMessage: '',
      labbookName: '',
      error: false,
      success: false
    };
  } else if (action.type === UPLOAD_MESSAGE) {
   return {
     ...state,
     uploadMessage: action.payload.uploadMessage,
     error: (action.payload.error === undefined) ? false :  action.payload.error
   };
 } else if(action.type === RESET_FOOTER_STORE){
   return {
     ...state,
     bytesUploaded: 0,
     totalBytes: 0,
     percentage: 0,
     loadingState: false,
     uploadMessage: '',
     error: false,
     success: false,
     labbookname: '',
     totalFiles: 0,
     index: 0
   };
 }

 return state;
};

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
   open: false,
   showProgressBar: true,
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
     error: action.payload.error,
    showProgressBar: false,
    open: true,
    success: false
   };
 } else if (action.type === IMPORT_SUCCESS) {
  return {
    ...state,
    uploadMessage: action.payload.uploadMessage,
    labbookName: action.payload.labbookName,
    open: true,
    success: action.payload.success,
    showProgressBar: true,
    error: false
  };
}else if (action.type === LOADING_PROGRESS) {
   return {
     ...state,
     bytesUploaded: action.payload.bytesUploaded,
     percentage: action.payload.percentage,
     totalBytes:  action.payload.totalBytes,
     open: true,
     showProgressBar: true,
     uploadMessage: '',
     labbookName: '',
     error: false,
     success: false,
     index:  0,
     totalFiles:  0,

   };
 } else if (action.type === BATCH_LOADING_PROGRESS) {

    return {
      ...state,
      index:  action.payload.index,
      totalFiles:  action.payload.totalFiles,
      percentage: 0,
      totalBytes:  0,
      open: true,
      uploadMessage: '',
      showProgressBar: true,
      labbookName: '',
      error: false,
      success: false
    };
  } else if (action.type === UPLOAD_MESSAGE) {
   return {
     ...state,
     uploadMessage: action.payload.uploadMessage,
     open: true,
     success: action.payload.success,
     error: (action.payload.error === undefined) ? false :  action.payload.error,
     showProgressBar: false
   };
 } else if(action.type === RESET_FOOTER_STORE){
   return {
     ...state,
     bytesUploaded: 0,
     totalBytes: 0,
     percentage: 0,
     open: false,
     showProgressBar: false,
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

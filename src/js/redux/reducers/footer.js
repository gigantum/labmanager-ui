/**
 * constants
 */
export const UPLOAD_ERROR = 'UPLOAD_ERROR';
export const LOADING_PROGRESS = 'LOADING_PROGRESS';
export const UPLOAD_MESSAGE = 'UPLOAD_MESSAGE';

export default (
 state = {
   bytesUploaded: 0,
   totalBytes: 0,
   percentage: 0,
   loadingState: false,
   uploadMessage: '',
   error: false
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
     loadingState: action.payload.loadingState
   };
 } else if (action.type === UPLOAD_MESSAGE) {
   return {
     ...state,
     uploadMessage: action.payload.uploadMessage,
     error: (action.payload.error === undefined) ? false :  action.payload.error
   };
 }

 return state;
};

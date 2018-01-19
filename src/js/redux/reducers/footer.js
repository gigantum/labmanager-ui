/**
 * constants
 */
 //messages that have a constant state
export const ERROR_MESSAGE = 'ERROR_MESSAGE';
export const INFO_MESSAGE = 'INFO_MESSAGE';
export const REMOVE_MESSAGE = 'REMOVE_MESSAGE'
//loaders with updating state
// file updating
export const UPLOAD_MESSAGE_SETTER = 'UPLOAD_MESSAGE_SETTER';
export const UPLOAD_MESSAGE_UPDATE = 'UPLOAD_MESSAGE_UPDATE';
export const UPLOAD_MESSAGE_REMOVE = 'UPLOAD_MESSAGE_REMOVE';
export const IMPORT_MESSAGE_SUCCESS = 'IMPORT_MESSAGE_SUCCESS';
//
export const RESET_FOOTER_STORE = "RESET_FOOTER_STORE"
export const TOGGLE_MESSAGE_LIST = 'TOGGLE_MESSAGE_LIST'

let tempId = 0

export default (
 state = {
   open: false,
   uploadOpen: false,
   currentMessage: '',
   uploadMessage: '',
   currentId: '',
   currentUploadId: '',
   uploadError: false,
   success: false,
   labbookName: '',
   messageStack: [],
   uploadStack: [],
   fileCount: 0,
   totalFiles: 0,
   totalBytes: 0,
   labbookSuccess: false,
   messageListOpen: false
 },
 action
) => {
 if (action.type === ERROR_MESSAGE) {
   let id = ERROR_MESSAGE + tempId++
   let messageStack = state.messageStack

   messageStack.push({
     message: action.payload.message,
     id: id,
     error: true,
     className: 'Footer__message--error',
     messageBody: action.payload.messagesList
   })

   return {
     ...state,
    messageStack: messageStack,
    currentId: id,
    showProgressBar: false,
    open: true,
    success: false
   };
 } else if (action.type === INFO_MESSAGE) { //this is for only updating a single message
  let id = INFO_MESSAGE + tempId++
  let messageStack = state.messageStack

  messageStack.push(
    {
      message: action.payload.message,
      id: id,
      error: false,
      className: 'Footer__message',
      messageBody: action.payload.messagesList ? action.payload.messagesList : []
  })

  return {
    ...state,
    currentMessage: action.payload.message,
    currentId: id,
    messageStack: messageStack,
    open: true,
    success: true,
    showProgressBar: false
  };
} else if (action.type === REMOVE_MESSAGE) { //this is for only updating a single message
    let messageStack = []

    state.messageStack.forEach((messageItem)=>{
        if(messageItem.id !== action.payload.id){
          messageStack.push(messageItem)
        }
    })

    let lastIndex = messageStack.length - 1;

 return {
   ...state,
   currentMessage: messageStack[lastIndex],
   currentId:  messageStack[lastIndex],
   messageStack: messageStack,
   open: messageStack.length > 0,
   success: true,
   showProgressBar: false
 };
}else if (action.type === UPLOAD_MESSAGE_SETTER) {
  let message = {
    message: action.payload.currentMessage,
    id: action.payload.id,
    progessBarPercentage:  action.payload.percentage
  }

  let uploadStack = state.uploadStack
  uploadStack.push(message)

  return {
    ...state,
    uploadMessage: action.payload.uploadMessage,
    uploadStack: uploadStack,
    currentUploadId: message.id,
    uploadOpen: true,
    success: false,
    uploadError: false,
    fileCount: 0,
    totalBytes: action.payload.totalBytes ? action.payload.totalBytes : 0,
    totalFiles: action.payload.totalFiles ? action.payload.totalFiles : 0
  };
}else if (action.type === UPLOAD_MESSAGE_UPDATE) {
  let message = {
    message: action.payload.uploadMessage,
    id: action.payload.id,
    progessBarPercentage:  action.payload.percentage,
  }

  let uploadStack = state.uploadStack.map((messageItem)=>{
      if(message.id === messageItem.id){
        return message
      }else{
        return messageItem
      }
  })
  const uploadError = action.payload.uploadError ? action.payload.uploadError : false;
  const uploadMessage = action.payload.uploadError ? "Error Uploading" : action.payload.uploadMessage;
  return {
    ...state,
    uploadMessage: uploadMessage,
    currentUploadId: action.payload.id,
    progessBarPercentage: action.payload.progessBarPercentage,
    fileCount: action.payload.fileCount,
    uploadStack: uploadStack,
    uploadOpen: true,
    uploadError: uploadError,
    success: false
  };
} else if (action.type === UPLOAD_MESSAGE_REMOVE) {
  let message = {
    message: action.payload.uploadMessage,
    id: action.payload.id,
    progessBarPercentage:  action.payload.progessBarPercentage
  }

  let uploadStack = []

  state.uploadStack.forEach((messageItem)=>{
      if(message.id !== messageItem.id){
        uploadStack.push(messageItem)
      }
  })

  return {
    ...state,
    uploadMessage: '',
    currentUploadId: message.id,
    uploadStack: uploadStack,
    progessBarPercentage: 0,
    fileCount: 0,
    totalFiles: 0,
    uploadOpen: false,
    success: true,
    labbookName: '',
    labbookSuccess: false
  };
} else if (action.type === IMPORT_MESSAGE_SUCCESS) {

  let message = {
    message: action.payload.uploadMessage,
    id: action.payload.id,
    progessBarPercentage: 100
  }

  let uploadStack = []

  state.uploadStack.forEach((messageItem)=>{
      if(message.id !== messageItem.id){
        uploadStack.push(messageItem)
      }
  })

  return {
    ...state,
    uploadMessage: action.payload.uploadMessage,
    labbookName: action.payload.labbookName,
    currentUploadId: message.id,
    uploadStack: uploadStack,
    progessBarPercentage: 100,
    uploadOpen: true,
    success: true,
    labbookSuccess: true
  };
}else if(action.type === TOGGLE_MESSAGE_LIST){
   return {
     ...state,
     messageListOpen: action.payload.messageListOpen
   }
 }else if(action.type === RESET_FOOTER_STORE){
   return {
     ...state,
     open: false,
     uploadOpen: false,
     showProgressBar: true,
     currentMessage: '',
     currentId: '',
     uploadError: false,
     success: false,
     labbookName: '',
     messageListOpen: false
   }
 }

 return state;
};

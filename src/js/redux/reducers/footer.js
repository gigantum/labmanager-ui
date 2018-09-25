import uuidv4 from 'uuid/v4';
import dispatcher from 'JS/redux/dispatcher';

/**
 * constants
 */
// messages that have a constant state
export const ERROR_MESSAGE = 'ERROR_MESSAGE';
export const INFO_MESSAGE = 'INFO_MESSAGE';
export const WARNING_MESSAGE = 'WARNING_MESSAGE';
export const REMOVE_MESSAGE = 'REMOVE_MESSAGE';
// loaders with updating state
// file updating
export const UPLOAD_MESSAGE_SETTER = 'UPLOAD_MESSAGE_SETTER';
export const UPLOAD_MESSAGE_UPDATE = 'UPLOAD_MESSAGE_UPDATE';
export const UPLOAD_MESSAGE_REMOVE = 'UPLOAD_MESSAGE_REMOVE';
export const IMPORT_MESSAGE_SUCCESS = 'IMPORT_MESSAGE_SUCCESS';
//
export const RESET_FOOTER_STORE = 'RESET_FOOTER_STORE';
export const TOGGLE_MESSAGE_LIST = 'TOGGLE_MESSAGE_LIST';
export const HIDE_MESSAGE_LIST = 'HIDE_MESSAGE_LIST';

export const MULTIPART_INFO_MESSAGE = 'MULTIPART_INFO_MESSAGE';
export const MULTIPART_ERROR_MESSAGE = 'MULTIPART_ERROR_MESSAGE';

export const UPDATE_MESSAGE_STACK_ITEM_VISIBILITY = 'UPDATE_MESSAGE_STACK_ITEM_VISIBILITY';
export const UPDATE_HISTORY_STACK_ITEM_VISIBILITY = 'UPDATE_HISTORY_STACK_ITEM_VISIBILITY';


export const RESIZE_FOOTER = 'RESIZE_FOOTER';
export const UPDATE_HISTORY_VIEW = 'UPDATE_HISTORY_VIEW';
export const HELPER_VISIBLE = 'HELPER_VISIBLE';


/**
 * actions
 */
export const setErrorMessage = (message, messageBody) => dispatcher(ERROR_MESSAGE, { message, messageBody });
export const setWarningMessage = message => dispatcher(WARNING_MESSAGE, { message });
export const setInfoMessage = message => dispatcher(INFO_MESSAGE, { message });
export const setMultiInfoMessage = (id, message, isLast, error, messageBody) => dispatcher(MULTIPART_INFO_MESSAGE, {
  id, message, isLast, error, messageBody,
});
export const setUploadMessageSetter = (uploadMessage, id, totalFiles) => dispatcher(UPLOAD_MESSAGE_SETTER, { uploadMessage, id, totalFiles });
export const setUploadMessageUpdate = (uploadMessage, id, percentage, uploadError) => dispatcher(UPLOAD_MESSAGE_UPDATE, {
  uploadMessage, id, percentage, uploadError,
});
export const setUploadMessageRemove = (uploadMessage, id, progessBarPercentage) => dispatcher(UPLOAD_MESSAGE_REMOVE, { uploadMessage, id, progessBarPercentage });
export const setHelperVisible = helperVisible => dispatcher(HELPER_VISIBLE, { helperVisible });
export const setUpdateHistoryView = () => dispatcher(UPDATE_HISTORY_VIEW, {});
export const setResizeFooter = () => dispatcher(RESIZE_FOOTER, {});
export const setResetFooter = () => dispatcher(RESET_FOOTER_STORE, {});
export const setRemoveMessage = id => dispatcher(REMOVE_MESSAGE, { id });
export const setToggleMessageList = (messageListOpen, viewHistory) => dispatcher(TOGGLE_MESSAGE_LIST, { messageListOpen, viewHistory });
export const setUpdateMessageStackItemVisibility = index => dispatcher(UPDATE_MESSAGE_STACK_ITEM_VISIBILITY, { index });
export const setUpdateHistoryStackItemVisibility = index => dispatcher(UPDATE_HISTORY_STACK_ITEM_VISIBILITY, { index });


let tempId = 0;
const messageStackHistory = sessionStorage.getItem('messageStackHistory') ? JSON.parse(sessionStorage.getItem('messageStackHistory')) : [];

export default(state = {
  open: false,
  uploadOpen: false,
  currentMessage: '',
  uploadMessage: '',
  currentId: '',
  currentUploadId: '',
  uploadError: false,
  success: false,
  labbookName: '',
  messageStackHistory,
  messageStack: [],
  uploadStack: [],
  fileCount: 0,
  totalFiles: 0,
  totalBytes: 0,
  labbookSuccess: false,
  messageListOpen: false,
  viewHistory: false,
  helperVisible: false,
  uuid: '',
}, action) => {
  const checkHistoryStackLength = (messageStackHistory) => {
    if (messageStackHistory.length > 50) {
      messageStackHistory.pop();
    }

    return messageStackHistory;
  };
  const date = new Date();
  if (action.type === ERROR_MESSAGE) {
    let id = ERROR_MESSAGE + tempId++,
      messageStack = state.messageStack,
      messageStackHistory = state.messageStackHistory,
      message = {
        message: action.payload.message,
        id,
        error: true,
        date,
        messageBodyOpen: false,
        className: 'Footer__message--error',
        messageBody: action.payload.messageBody
          ? action.payload.messageBody
          : [],
      };

    messageStack.unshift(message);
    messageStackHistory.unshift(message);

    messageStackHistory = checkHistoryStackLength(messageStackHistory);

    sessionStorage.setItem('messageStackHistory', JSON.stringify(messageStackHistory));

    return {
      ...state,
      messageStack,
      messageStackHistory,
      currentId: id,
      showProgressBar: false,
      open: true,
      success: false,
      messageListOpen: true,
      viewHistory: false,
    };
  } else if (action.type === INFO_MESSAGE) { // this is for only updating a single message
    let id = INFO_MESSAGE + tempId++,
      messageStack = state.messageStack,
      messageStackHistory = state.messageStackHistory,
      message = {
        message: action.payload.message,
        id,
        error: false,
        className: 'Footer__message',
        messageBody: action.payload.messageBody
          ? action.payload.messageBody
          : [],
        isMultiPart: false,
        messageBodyOpen: false,
        date,
      };

    messageStack.unshift(message);
    messageStackHistory.unshift(message);

    messageStackHistory = checkHistoryStackLength(messageStackHistory);

    sessionStorage.setItem('messageStackHistory', JSON.stringify(messageStackHistory));

    return {
      ...state,
      messageStack,
      messageStackHistory,
      currentMessage: action.payload.message,
      currentId: id,
      open: true,
      success: true,
      showProgressBar: false,
      messageListOpen: true,
      viewHistory: false,
    };
  } else if (action.type === WARNING_MESSAGE) { // this is for only updating a single message
    const id = INFO_MESSAGE + tempId++;
    const messageStack = state.messageStack;
    let messageStackHistory = state.messageStackHistory;

    const message = {
      message: action.payload.message,
      id,
      error: false,
      className: 'Footer__message--warning',
      messageBody: action.payload.messageBody
        ? action.payload.messageBody
        : [],
      messageBodyOpen: false,
      date,
    };

    messageStack.unshift(message);

    messageStackHistory.unshift(message);
    messageStackHistory = checkHistoryStackLength(messageStackHistory);

    sessionStorage.setItem('messageStackHistory', JSON.stringify(messageStackHistory));

    return {
      ...state,
      currentMessage: action.payload.message,
      currentId: id,
      messageStack,
      messageStackHistory,
      open: true,
      success: true,
      showProgressBar: false,
      messageListOpen: true,
      viewHistory: false,
    };
  } else if (action.type === REMOVE_MESSAGE) { // this is for only updating a single message
    const messageStack = [];

    state.messageStack.forEach((messageItem) => {
      if (messageItem.id !== action.payload.id) {
        messageStack.push(messageItem);
      }
    });

    const messageListOpen = (state.viewHistory && state.messageListOpen) || (!state.viewHistory && (messageStack.length > 0));
    const lastIndex = messageStack.length - 1;

    return {
      ...state,
      currentMessage: messageStack[lastIndex],
      currentId: messageStack[lastIndex],
      messageStack,
      open: messageStack.length > 0,
      success: true,
      showProgressBar: false,
      messageListOpen,

    };
  } else if (action.type === UPLOAD_MESSAGE_SETTER) {
    const message = {
      message: action.payload.currentMessage,
      id: action.payload.id,
      progessBarPercentage: action.payload.percentage,
    };

    const uploadStack = state.uploadStack;
    uploadStack.push(message);

    return {
      ...state,
      uploadStack,
      uploadMessage: action.payload.uploadMessage,
      currentUploadId: message.id,
      uploadOpen: true,
      success: false,
      uploadError: false,
      fileCount: 0,
      totalBytes: action.payload.totalBytes
        ? action.payload.totalBytes
        : 0,
      totalFiles: action.payload.totalFiles
        ? action.payload.totalFiles
        : 0,
      viewHistory: false,
    };
  } else if (action.type === UPLOAD_MESSAGE_UPDATE) {
    const message = {
      message: action.payload.uploadMessage,
      id: action.payload.id,
      progessBarPercentage: action.payload.percentage,
    };

    const uploadStack = state.uploadStack.map((messageItem) => {
      if (message.id === messageItem.id) {
        return message;
      }
      return messageItem;
    });

    const uploadError = action.payload.uploadError
      ? action.payload.uploadError
      : false;

    const uploadMessage = action.payload.uploadError
      ? 'Error Uploading'
      : action.payload.uploadMessage;

    return {
      ...state,
      uploadMessage,
      currentUploadId: action.payload.id,
      progessBarPercentage: action.payload.progessBarPercentage,
      fileCount: action.payload.fileCount,
      uploadStack,
      uploadOpen: true,
      uploadError,
      success: false,
    };
  } else if (action.type === UPLOAD_MESSAGE_REMOVE) {
    const message = {
      message: action.payload.uploadMessage,
      id: action.payload.id,
      progessBarPercentage: action.payload.progessBarPercentage,
    };

    const uploadStack = [];

    state.uploadStack.forEach((messageItem) => {
      if (message.id !== messageItem.id) {
        uploadStack.push(messageItem);
      }
    });

    return {
      ...state,
      uploadMessage: '',
      currentUploadId: message.id,
      uploadStack,
      progessBarPercentage: 0,
      fileCount: 0,
      totalFiles: 0,
      uploadOpen: false,
      success: true,
      labbookName: '',
      labbookSuccess: false,
    };
  } else if (action.type === IMPORT_MESSAGE_SUCCESS) {
    const message = {
      message: action.payload.uploadMessage,
      id: action.payload.id,
      progessBarPercentage: 100,
    };

    const uploadStack = [];

    state.uploadStack.forEach((messageItem) => {
      if (message.id !== messageItem.id) {
        uploadStack.push(messageItem);
      }
    });

    return {
      ...state,
      uploadMessage: action.payload.uploadMessage,
      labbookName: action.payload.labbookName,
      currentUploadId: message.id,
      uploadStack,
      progessBarPercentage: 100,
      uploadOpen: true,
      success: true,
      labbookSuccess: true,
    };
  } else if (action.type === TOGGLE_MESSAGE_LIST) {
    const messageStack = [];

    const messageStackHistory = state.messageStackHistory.map((message) => {
      message.dismissed = true;
      return message;
    });

    return {
      ...state,
      messageListOpen: action.payload.messageListOpen,
      viewHistory: action.payload.viewHistory,
      messageStack,
      messageStackHistory,
    };
  } else if (action.type === HIDE_MESSAGE_LIST) {
    return {
      ...state,
      messageListOpen: false,
    };
  } else if (action.type === MULTIPART_INFO_MESSAGE) {
    let messageStackHistory = state.messageStackHistory,
      messageStack = state.messageStack,
      previousHistoryIndex = 0,
      previousIndex = 0,
      messageBodyOpen = false,
      messageListOpen = state.messageListOpen;

    const doesMessageExist = messageStack.filter((message, index) => {
      if (message.id === action.payload.id) {
        previousIndex = index;
        messageBodyOpen = message.messageBodyOpen;
      }

      return message.id === action.payload.id;
    });


    const doesHistoryMessageExist = messageStackHistory.filter((message, index) => {
      if (message.id === action.payload.id) {
        previousHistoryIndex = index;

        if (doesMessageExist.length === 0) {
          messageBodyOpen = message.messageBodyOpen;
        }
      }

      return message.id === action.payload.id;
    });

    if ((doesHistoryMessageExist.length > 0) && doesHistoryMessageExist[0].dismissed) {
      if (state.messageListOpen && state.viewHistory) {
        messageListOpen = true;
      } else {
        messageListOpen = false;
      }
    } else {
      messageListOpen = true;
    }


    const message = {
      message: action.payload.message,
      id: action.payload.id,
      className: action.payload.error
        ? 'Footer__message--error'
        : 'Footer__message',
      isLast: action.payload.isLast,
      isMultiPart: true,
      messageBody: action.payload.messageBody
        ? action.payload.messageBody
        : [],
      error: action.payload.error,
      messageBodyOpen,
      dismissed: (doesHistoryMessageExist.length > 0) ? doesHistoryMessageExist[0].dismissed : false,
      date,
    };


    if (doesMessageExist.length > 0) {
      messageStack.splice(previousIndex, 1, message);
    } else {
      messageStack.unshift(message);
    }


    if (doesHistoryMessageExist.length > 0) {
      messageStackHistory.splice(previousHistoryIndex, 1, message);
    } else {
      messageStackHistory.unshift(message);
    }

    messageStackHistory = checkHistoryStackLength(messageStackHistory);

    sessionStorage.setItem('messageStackHistory', JSON.stringify(messageStackHistory));

    return {
      ...state,
      id: action.payload.id,
      message: action.payload.message,
      isLast: action.payload.isLast,
      messageStack,
      messageStackHistory,
      open: true,
      success: true,
      error: action.payload.error,
      messageListOpen,
      viewHistory: ((doesHistoryMessageExist.length > 0) && doesHistoryMessageExist[0].dismissed && state.viewHistory),
    };
  } else if (action.type === RESET_FOOTER_STORE) {
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
      messageListOpen: false,
      viewHistory: false,
    };
  } else if (action.type === UPDATE_MESSAGE_STACK_ITEM_VISIBILITY) {
    const messageStack = state.messageStack;

    messageStack[action.payload.index].messageBodyOpen = !messageStack[action.payload.index].messageBodyOpen;

    return {
      ...state,
      messageStack,
      uuid: uuidv4(),
    };
  } else if (action.type === UPDATE_HISTORY_STACK_ITEM_VISIBILITY) {
    const messageStackHistory = state.messageStackHistory;
    const messageStackItem = messageStackHistory[action.payload.index];

    messageStackItem.messageBodyOpen = !messageStackItem.messageBodyOpen;

    messageStackHistory[action.payload.index] = messageStackItem;

    return {
      ...state,
      messageStackHistory,
      uuid: uuidv4(),
    };
  } else if (action.type === RESIZE_FOOTER) {
    return {
      ...state,
      resize: uuidv4(),
    };
  } else if (action.type === UPDATE_HISTORY_VIEW) {
    const messageStack = [];

    const messageStackHistory = state.messageStackHistory.map((message) => {
      message.dismissed = true;
      return message;
    });

    return {
      ...state,
      viewHistory: true,
      messageStack,
      messageStackHistory,
    };
  } else if (action.type === HELPER_VISIBLE) {
    return {
      ...state,
      helperVisible: action.payload.helperVisible,
    };
  }

  return state;
};

import uuidv4 from 'uuid/v4'

/**
 * constants
 */
export const UPDATE_HELPER_VISIBILITY = 'UPDATE_HELPER_VISIBILITY';
export const RESIZE_HELPER = 'RESIZE_HELPER';



export default (
 state = {
   'isVisible': false,
   'resize': ''
 },
 action
) => {
 if (action.type === UPDATE_HELPER_VISIBILITY) {
   return {
     ...state,
     isVisible: action.payload.isVisible
   };
 }else if (action.type === RESIZE_HELPER) {
    return {
      ...state,
      resize: uuidv4()
    };
  }

 return state;
};

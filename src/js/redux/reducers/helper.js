import uuidv4 from 'uuid/v4'

/**
 * constants
 */
export const UPDATE_HELPER_VISIBILITY = 'UPDATE_HELPER_VISIBILITY';
export const RESIZE_HELPER = 'RESIZE_HELPER';
export const FOOTER_VISIBLE = 'FOOTER_VISIBLE'



export default (
 state = {
   'isVisible': false,
   'resize': '',
   'footerVisible': false,
   'uploadOpen': false
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
  }else if (action.type === FOOTER_VISIBLE) {
     return {
       ...state,
       footerVisible: action.payload.footerVisible
     };
   }

 return state;
};

/**
 * constants
 */
export const UPDATE_HELPER_VISIBILITY = 'UPDATE_HELPER_VISIBILITY';



export default (
 state = {
   'isVisible': false
 },
 action
) => {
 if (action.type === UPDATE_HELPER_VISIBILITY) {
   return {
     ...state,
     isVisible: action.payload.isVisible
   };
 }

 return state;
};

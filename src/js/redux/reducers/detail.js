/**
 * constants
 */
export const UPDATE_DETAIL_VIEW = 'UPDATE_DETAIL_VIEW';
export const RESET_STORE = 'RESET_STORE';



export default (
 state = {
   'detailMode': false
 },
 action
) => {
 if (action.type === UPDATE_DETAIL_VIEW) {
   console.log('UPDATE_DETAIL_VIEW')
   return {
     ...state,
     detailMode: action.payload.detailView
   };
 }else if(action.type === RESET_STORE){
   console.log(RESET_STORE)
   return {
     ...state,
     detailMode: false
   };
 }

 return state;
};

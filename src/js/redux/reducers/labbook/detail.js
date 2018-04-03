/**
 * constants
 */
export const UPDATE_DETAIL_VIEW = 'UPDATE_DETAIL_VIEW';
export const RESET_DETAIL_STORE = 'RESET_DETAIL_STORE';



export default (
 state = {
   'detailMode': false
 },
 action
) => {
 if (action.type === UPDATE_DETAIL_VIEW) {
    //preventing detail mode from opening until feature has been fully implemented
   return {
     ...state,
     detailMode: false//action.payload.detailMode 
   };
 }else if(action.type === RESET_DETAIL_STORE){
   return {
     ...state,
     detailMode: false
   };
 }

 return state;
};

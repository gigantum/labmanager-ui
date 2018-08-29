import dispatcher from 'JS/redux/dispatcher'

/**
 * constants
 */
export const UPDATE_CONTAINER_STATUS = 'UPDATE_CONTAINER_STATUS'
export const RESET_DETAIL_STORE = 'RESET_DETAIL_STORE'
export const UPDATE_CONTAINER_MENU_VISIBILITY = 'UPDATE_CONTAINER_MENU_VISIBILITY'

/**
 * actions
 */

export const setContainerStatus = (status) => dispatcher(UPDATE_CONTAINER_STATUS, {status})
export const setContainerMenuVisibility = (containerMenuOpen) => dispatcher(UPDATE_CONTAINER_MENU_VISIBILITY, {containerMenuOpen})

export default (
 state = {
   'status': "",
   'containerMenuOpen': false,
 },
 action
) => {

if (action.type === UPDATE_CONTAINER_STATUS) {
   return {
     ...state,
     status: action.payload.status
   };
 }else if (action.type === UPDATE_CONTAINER_MENU_VISIBILITY) {

   return {
     ...state,
     containerMenuOpen: action.payload.containerMenuOpen
   };
 }else if(action.type === RESET_DETAIL_STORE){
   return {
     ...state,
     detailMode: false
   };
 }

 return state;
};

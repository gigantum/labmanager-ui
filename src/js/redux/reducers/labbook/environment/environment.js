/**
 * constants
 */
export const CLOSE_ENVIRONMENT_MENUS = 'CLOSE_ENVIRONMENT_MENUS'
export const TOGGLE_PACKAGE_MENU = 'TOGGLE_PACKAGE_MENU'
export const TOGGLE_CUSTOM_MENU = 'TOGGLE_CUSTOM_MENU'
export const RESET_DETAIL_STORE = 'RESET_DETAIL_STORE'
export const CONTAINER_MENU_WARNING = 'CONTAINER_MENU_WARNING'
export const UPDATE_CONTAINER_MENU_VISIBILITY = 'UPDATE_CONTAINER_MENU_VISIBILITY'



export default (
 state = {
   'status': "",
   'containerMenuOpen': false,
   'containerMenuWarning': ''
 },
 action
) => {

if (action.type === CLOSE_ENVIRONMENT_MENUS) {
   return {
     ...state,
     packageMenuVisible: false,
     viewContainerVisible: false
   };
 }else if (action.type === TOGGLE_PACKAGE_MENU) {

   return {
     ...state,
     packageMenuVisible: action.payload.packageMenuVisible
   };
 }else if (action.type === TOGGLE_CUSTOM_MENU) {
   return {
     ...state,
     viewContainerVisible: action.payload.viewContainerVisible
   };
 }else if(action.type === RESET_DETAIL_STORE){
   return {
     ...state,
     detailMode: false
   };
 } else if(action.type === CONTAINER_MENU_WARNING) {
  return {
    ...state,
    containerMenuWarning: action.payload.message
  }
} else if (action.type === UPDATE_CONTAINER_MENU_VISIBILITY) {
  
  return {
    ...state,
    containerMenuOpen: action.payload.containerMenuOpen
  };
}

 return state;
};

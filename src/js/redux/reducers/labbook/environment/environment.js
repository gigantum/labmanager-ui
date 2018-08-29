import dispatcher from 'JS/redux/dispatcher'

/**
 * constants
 */
export const CLOSE_ENVIRONMENT_MENUS = 'CLOSE_ENVIRONMENT_MENUS'
export const RESET_DETAIL_STORE = 'RESET_DETAIL_STORE'
export const CONTAINER_MENU_WARNING = 'CONTAINER_MENU_WARNING'
export const UPDATE_CONTAINER_MENU_VISIBILITY = 'UPDATE_CONTAINER_MENU_VISIBILITY'

/**
 * actions
 */
export const setContainerMenuWarningMessage = (message) => {
  dispatcher('CONTAINER_MENU_WARNING', {message})
  dispatcher('UPDATE_CONTAINER_MENU_VISIBILITY', {containerMenuOpen: true})
}
export const setContainerMenuVisibility = (containerMenuOpen) => dispatcher(UPDATE_CONTAINER_MENU_VISIBILITY, {containerMenuOpen})
export const setCloseEnvironmentMenus = () => dispatcher(CLOSE_ENVIRONMENT_MENUS, {})


export default (
 state = {
   'status': "",
   'containerMenuOpen': false,
   'containerMenuWarning': '',
   'viewContainerVisible': false,
   'detailMode': false,
 },
 action
) => {

if (action.type === CLOSE_ENVIRONMENT_MENUS) {
   return {
     ...state,
     packageMenuVisible: false,
     viewContainerVisible: false
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

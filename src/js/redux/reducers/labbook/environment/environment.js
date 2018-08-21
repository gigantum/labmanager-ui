/**
 * constants
 */
export const CLOSE_ENVIRONMENT_MENUS = 'CLOSE_ENVIRONMENT_MENUS'
export const TOGGLE_PACKAGE_MENU = 'TOGGLE_PACKAGE_MENU'
export const TOGGLE_CUSTOM_MENU = 'TOGGLE_CUSTOM_MENU'
export const RESET_DETAIL_STORE = 'RESET_DETAIL_STORE'
export const CONTAINER_MENU_WARNING = 'CONTAINER_MENU_WARNING'
export const UPDATE_CONTAINER_MENU_VISIBILITY = 'UPDATE_CONTAINER_MENU_VISIBILITY'
export const SET_LATEST_PACKAGES = 'SET_LATEST_PACKAGES'
export const SET_LATEST_FETCHED = 'SET_LATEST_FETCHED'
export const SET_REFETCH_PENDING = 'SET_REFETCH_PENDING'
export const SET_REFETCH_OCCURING = 'SET_REFETCH_OCCURING'
export const SET_REFETCH_QUEUED = 'SET_REFETCH_QUEUED'
export const FORCE_REFETCH = 'FORCE_REFETCH'
export const FORCE_CANCEL_REFETCH = 'FORCE_CANCEL_REFETCH'



export default (
 state = {
   'status': "",
   'containerMenuOpen': false,
   'containerMenuWarning': '',
   'packageMenuVisible': false,
   'viewContainerVisible': false,
   'detailMode': false,
   'latestPackages': {},
   'latestFetched': false,
   'refetchPending': false,
   'forceRefetch': false,
   'refetchOccuring': false,
   'refetchQueued': false,
   'forceCancelRefetch': false,
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
} else if (action.type === SET_LATEST_PACKAGES) {
  return {
    ...state,
    latestPackages: action.payload.latestPackages
  }
} else if (action.type === SET_LATEST_FETCHED) {
  return {
    ...state,
    latestFetched: action.payload.latestFetched
  }
} else if (action.type === SET_REFETCH_PENDING) {
  return {
    ...state,
    refetchPending: action.payload.refetchPending
  }
} else if (action.type === FORCE_REFETCH) {
  return {
    ...state,
    forceRefetch: action.payload.forceRefetch
  }
} else if (action.type === SET_REFETCH_OCCURING) {
  return {
    ...state,
    refetchOccuring: action.payload.refetchOccuring
  }
} else if (action.type === SET_REFETCH_QUEUED) {
  return {
    ...state,
    refetchQueued: action.payload.refetchQueued
  }
} else if (action.type === FORCE_CANCEL_REFETCH) {
  return {
    ...state,
    forceCancelRefetch: action.payload.forceCancelRefetch,
    refetchOccuring: false,
    refetchQueued: true,
  }
}

 return state;
};

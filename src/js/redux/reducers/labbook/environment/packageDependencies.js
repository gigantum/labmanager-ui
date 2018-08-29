import dispatcher from 'JS/redux/dispatcher'

/**
 * constants
 */
export const TOGGLE_PACKAGE_MENU = 'TOGGLE_PACKAGE_MENU'
export const SET_LATEST_PACKAGES = 'SET_LATEST_PACKAGES'
export const SET_LATEST_FETCHED = 'SET_LATEST_FETCHED'
export const SET_REFETCH_PENDING = 'SET_REFETCH_PENDING'
export const SET_REFETCH_OCCURING = 'SET_REFETCH_OCCURING'
export const SET_REFETCH_QUEUED = 'SET_REFETCH_QUEUED'
export const FORCE_REFETCH = 'FORCE_REFETCH'
export const FORCE_CANCEL_REFETCH = 'FORCE_CANCEL_REFETCH'

/**
 * actions
 */
export const setLatestFetched = (latestFetched) => dispatcher(SET_LATEST_FETCHED, {latestFetched})
export const setForceRefetch = (forceRefetch) => dispatcher(FORCE_REFETCH, {forceRefetch})
export const setForceCancelRefetch = (forceCancelRefetch) => dispatcher(FORCE_CANCEL_REFETCH, {forceCancelRefetch})
export const setLatestPackages = (latestPackages) => dispatcher(SET_LATEST_PACKAGES, {latestPackages})
export const setRefetchOccuring = (refetchOccuring) => dispatcher(SET_REFETCH_OCCURING, {refetchOccuring})
export const setRefetchQueued = (refetchQueued) => dispatcher(SET_REFETCH_QUEUED, {refetchQueued})
export const setPackageMenuVisible = (packageMenuVisible) => dispatcher(TOGGLE_PACKAGE_MENU, {packageMenuVisible})


export default (
 state = {
   'packageMenuVisible': false,
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

if (action.type === TOGGLE_PACKAGE_MENU) {
   return {
     ...state,
     packageMenuVisible: action.payload.packageMenuVisible
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

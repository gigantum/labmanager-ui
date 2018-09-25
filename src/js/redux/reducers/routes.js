import dispatcher from 'JS/redux/dispatcher';

/**
 * constants
 */
export const UPDATE_LABBOOKNAME = 'UPDATE_LABBOOKNAME';
export const UPDATE_OWNER = 'UPDATE_OWNER';
export const UPDATE_ALL = 'UPDATE_ALL';
export const UPDATE_CALLBACK_ROUTE = 'UPDATE_CALLBACK_ROUTE';

/**
 * actions
 */
export const setCallbackRoute = callbackRoute => dispatcher(UPDATE_CALLBACK_ROUTE, { callbackRoute });
export const setUpdateAll = (owner, labbookName) => dispatcher(UPDATE_ALL, { owner, labbookName });

export default (
  state = {
    currentRoute: '',
    owner: '',
    labbookName: '',
    callbackRoute: '',
  },
  action,
) => {
  if (action.type === UPDATE_OWNER) {
    return {
      ...state,
      owner: action.payload.owner,
    };
  } else if (action.type === UPDATE_LABBOOKNAME) {
    return {
      ...state,
      labbookName: action.payload.labbookName,
    };
  } else if (action.type === UPDATE_CALLBACK_ROUTE) {
    sessionStorage.setItem('CALLBACK_ROUTE', action.payload.callbackRoute);
    return {
      ...state,
      callbackRoute: action.payload.callbackRoute,
    };
  } else if (action.type === UPDATE_ALL) {
    return {
      ...state,
      labbookName: action.payload.labbookName,
      owner: action.payload.owner,
    };
  }

  return state;
};

import uuidv4 from 'uuid/v4';
import dispatcher from 'JS/redux/dispatcher';

/**
 * constants
 */
export const UPDATE_HELPER_VISIBILITY = 'UPDATE_HELPER_VISIBILITY';
export const RESIZE_HELPER = 'RESIZE_HELPER';

/**
 * actions
 */
export const setHelperVisibility = isVisible => dispatcher(UPDATE_HELPER_VISIBILITY, { isVisible });
export const setResizeHelper = () => dispatcher(RESIZE_HELPER, {});

export default (
  state = {
    isVisible: false,
    resize: '',
    footerVisible: false,
  },
  action,
) => {
  if (action.type === UPDATE_HELPER_VISIBILITY) {
    return {
      ...state,
      isVisible: action.payload.isVisible,
    };
  } else if (action.type === RESIZE_HELPER) {
    return {
      ...state,
      resize: uuidv4(),
    };
  }

  return state;
};

import dispatcher from 'JS/redux/dispatcher';

/**
 * constants
 */
export const UPDATE_CONTAINER_STATE = 'UPDATE_CONTAINER_STATE';
export const RESET_OVERVIEW_STORE = 'RESET_OVERVIEW_STORE';

/**
 * actions
 */

export const setContainerState = (labbookId, containerState) => dispatcher(UPDATE_CONTAINER_STATE, { labbookId, containerState });

export default (
  state = {
    containerStates: {},
  },
  action,
) => {
  if (action.type === UPDATE_CONTAINER_STATE) {
    const containerStates = state.containerStates;
    containerStates[action.payload.labbookId] = action.payload.containerState;
    return {
      ...state,
      containerStates,
    };
  } else if (action.type === RESET_OVERVIEW_STORE) {
    return {
      ...state,
      containerStates: {},
    };
  }

  return state;
};

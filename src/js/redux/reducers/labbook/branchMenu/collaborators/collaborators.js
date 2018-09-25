import dispatcher from 'JS/redux/dispatcher';

/**
 * constants
 */
export const SET_COLLABORATORS = 'SET_COLLABORATORS';
export const SET_CANMANAGECOLLABORATORS = 'SET_CANMANAGECOLLABORATORS';

/**
 * actions
*/
export const setCollaborators = collaborators => dispatcher(SET_COLLABORATORS, { collaborators });
export const setCanManageCollaborators = canManageCollaborators => dispatcher(SET_CANMANAGECOLLABORATORS, { canManageCollaborators });


export default (
  state = {
    collaborators: null,
    canManageCollaborators: null,
  },
  action,
) => {
  if (action.type === SET_COLLABORATORS) {
    return {
      ...state,
      collaborators: action.payload.collaborators,
    };
  } else if (action.type === SET_CANMANAGECOLLABORATORS) {
    return {
      ...state,
      canManageCollaborators: action.payload.canManageCollaborators,
    };
  }
  return state;
};

/**
 * constants
 */
export const SET_COLLABORATORS = 'SET_COLLABORATORS'
export const SET_CANMANAGECOLLABORATORS = 'SET_CANMANAGECOLLABORATORS'


export default (
 state = {
  'collaborators': null,
  'canManageCollaborators': null,
 },
 action
) => {
if (action.type === SET_COLLABORATORS) {
   return {
     ...state,
     collaborators: action.payload.collaborators
   };
 }else if (action.type === SET_CANMANAGECOLLABORATORS) {

  return {
    ...state,
    canManageCollaborators: action.payload.canManageCollaborators
  };
}
 return state;
};

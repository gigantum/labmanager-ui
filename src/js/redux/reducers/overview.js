/**
 * constants
 */
export const UPDATE_CONTAINER_STATE = 'UPDATE_CONTAINER_STATE';
export const RESET_OVERVIEW_STORE = 'RESET_OVERVIEW_STORE';


export default (
 state = {
   containerStates: {}
 },
 action
) => {
 if (action.type === UPDATE_CONTAINER_STATE) {
    let containerStates = state.containerStates
    containerStates[action.payload.labbookId] = action.payload.containerState
   return {
     ...state,
     containerStates: containerStates
   };
 } else if(action.type === RESET_OVERVIEW_STORE){
   return {
     ...state,
     containerStates: {}
   };
 }

 return state;
};

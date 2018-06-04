/**
 * constants
 */
export const SET_FILTER_TEXT = 'SET_FILTER_TEXT';

export default (
 state = {
  filterText: '',
 },
 action
) => {
 if(action.type === SET_FILTER_TEXT){
  return {
    ...state,
    filterText: action.payload.filterText
  };
}

 return state;
};

/**
 * constants
 */
export const SET_FILTER_TEXT = 'SET_FILTER_TEXT';
export const SET_FILTER_TYPE = 'SET_FILTER_TYPE';
export const SET_SORT = 'SET_SORT';



export default (
 state = {
  selectedSort: 'Modified Date (Newest)',
  filterType: 'all',
  filterText: '',
  sort: 'modified_on',
  reverse: false,
 },
 action
) => {
 if (action.type === SET_SORT) {
  let sort = state.sort;
  let reverse = state.reverse
  switch(action.payload.selectedSort){
    case 'Modified Date (Newest)':
      sort = 'modified_on'
      reverse = false;
      break;
    case 'Modified Date (Oldest)':
      sort = 'modified_on'
      reverse = true;
      break;
    case 'Creation Date (Newest)':
      sort = 'created_on'
      reverse = false;
      break;
    case 'Creation Date (Oldest)':
      sort = 'created_on'
      reverse = true;
      break;
    case 'A-Z':
      sort = 'az'
      reverse = false;
      break;
    case 'Z-A':
      sort = 'az'
      reverse = true;
      break;
    default:
      break;
  }
   return {
     ...state,
     selectedSort: action.payload.selectedSort,
     sort,
     reverse,
   };
 }else if(action.type === SET_FILTER_TYPE){
   return {
     ...state,
     filterType: action.payload.filterType
   };
 }else if(action.type === SET_FILTER_TEXT){
  return {
    ...state,
    filterText: action.payload.filterText
  };
}

 return state;
};

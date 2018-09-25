import dispatcher from 'JS/redux/dispatcher';

/**
 * constants
 */
export const SET_FILTER_TEXT = 'SET_FILTER_TEXT';

/**
 * actions
 */
export const setFilterText = filterText => dispatcher(SET_FILTER_TEXT, { filterText });

export default (
  state = {
    filterText: '',
  },
  action,
) => {
  if (action.type === SET_FILTER_TEXT) {
    console.log({
      ...state,
      filterText: action.payload.filterText,
    });
    return {
      ...state,
      filterText: action.payload.filterText,
    };
  }

  return state;
};

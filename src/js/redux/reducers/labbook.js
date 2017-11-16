/**
 * constants
 */
export const INITIALIZE = 'INITIALIZE';
export const UPDATE_DETAIL_VIEW = 'UPDATE_DETAIL_VIEW';
export const RESET_STORE = 'RESET_STORE';
export const IS_BUILDING = 'IS_BUILDING'
export const MODAL_VISIBLE = 'MODAL_VISIBLE'
export const SELECTED_COMPONENT = 'SELECTED_COMPONENT'


export default (
 state = {
   'selectedComponent': '',
   'containerState': '',
   'imageStatus': '',
   'isBuilding': false,
   'containerStatus': '',
   'modalVisible': '',
   'detailMode': false,
   'previousDetailMode': false
 },
 action
) => {
 if (action.type === UPDATE_DETAIL_VIEW) {

   return {
     ...state,
     previousDetailMode: state.detailMode,
     detailMode: action.payload.detailView
  };
 }else if(action.type === INITIALIZE){

   return {
     ...state,
     'selectedComponent': action.payload.selectedComponent,
     'containerState':  action.payload.containerState,
     'imageStatus':  action.payload.imageStatus
   };
 } else if(action.type === IS_BUILDING){

   return {
     ...state,
     'isBuilding': action.payload.isBuilding,
   };
 }else if(action.type === SELECTED_COMPONENT){

   return {
     ...state,
     'selectedComponent': action.payload.selectedComponent,
   };
 }else if(action.type === MODAL_VISIBLE){

   return {
     ...state,
     'modalVisible': action.payload.modalVisible,
   };
 }else if(action.type === RESET_STORE){

   return {
     ...state,
     containerStates: {}
   };
 }

 return state;
};

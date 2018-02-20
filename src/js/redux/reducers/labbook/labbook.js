/**
 * constants
 */
export const INITIALIZE = 'INITIALIZE';
export const UPDATE_DETAIL_VIEW = 'UPDATE_DETAIL_VIEW';
export const RESET_LABBOOK_STORE = 'RESET_LABBOOK_STORE';
export const IS_BUILDING = 'IS_BUILDING'
export const MODAL_VISIBLE = 'MODAL_VISIBLE'
export const SELECTED_COMPONENT = 'SELECTED_COMPONENT'
export const UPDATE_BRANCHES_VIEW = 'UPDATE_BRANCHES_VIEW'
export const UPDATE_ALL = 'UPDATE_ALL'

export default (
 state = {
   'selectedComponent': '',
   'containerState': '',
   'imageStatus': '',
   'isBuilding': false,
   'containerStatus': '',
   'modalVisible': '',
   'detailMode': false,
   'previousDetailMode': false,
   'branchesOpen': false
 },
 action
) => {

 if (action.type === UPDATE_DETAIL_VIEW) {

   return {
     ...state,
     previousDetailMode: state.detailMode,
     detailMode: action.payload.detailMode
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
 }else if(action.type === UPDATE_BRANCHES_VIEW){
   return {
     ...state,
     'branchesOpen': action.payload.branchesOpen,
   };
 }else if(action.type === RESET_LABBOOK_STORE){

   return {
     ...state,
     'selectedComponent': '',
     'containerState': '',
     'imageStatus': '',
     'isBuilding': false,
     'containerStatus': '',
     'modalVisible': '',
     'detailMode': false,
     'previousDetailMode': false
   };
 }else if(action.type === UPDATE_ALL){

   return {
     ...state,
     labbookName: action.payload.labbookName,
     owner: action.payload.owner
   };
 }

 return state;
};
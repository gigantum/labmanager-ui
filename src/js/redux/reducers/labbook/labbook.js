import dispatcher from 'JS/redux/dispatcher'

/**
 * constants
 */
export const INITIALIZE = 'INITIALIZE';
export const UPDATE_DETAIL_VIEW = 'UPDATE_DETAIL_VIEW';
export const RESET_LABBOOK_STORE = 'RESET_LABBOOK_STORE';
export const IS_BUILDING = 'IS_BUILDING'
export const IS_SYNCING = 'IS_SYNCING'
export const IS_EXPORTING = 'IS_EXPORTING'
export const IS_PUBLISHING = 'IS_PUBLISHING'
export const MODAL_VISIBLE = 'MODAL_VISIBLE'
export const SELECTED_COMPONENT = 'SELECTED_COMPONENT'
export const UPDATE_BRANCHES_VIEW = 'UPDATE_BRANCHES_VIEW'
export const UPDATE_ALL = 'UPDATE_ALL'
export const UPDATE_STICKY_STATE = "UPDATE_STICKY_STATE"
export const MERGE_MODE = 'MERGE_MODE'


/**
 * actions
 */

export const setBuildingState = (isBuilding) => dispatcher(IS_BUILDING, {isBuilding})
export const setMergeMode = (branchesOpen, mergeFilter) => dispatcher(MERGE_MODE, {branchesOpen, mergeFilter})


export default (
 state = {
   'selectedComponent': '',
   'containerState': '',
   'imageStatus': '',
   'isBuilding': false,
   'isSyncing': false,
   'isExporting': false,
   'isPublishing': false,
   'containerStatus': '',
   'modalVisible': '',
   'detailMode': false,
   'previousDetailMode': false,
   'branchesOpen': false,
   'isSticky': false,
   'isExpanded': false,
   'mergeFilter': false
 },
 action
) => {

 if (action.type === UPDATE_DETAIL_VIEW) {
   //preventing detail mode from opening until feature has been fully implemented
   return {
     ...state,
     'previousDetailMode': false, //state.detailMode,
     'detailMode': false, //action.payload.detailMode
  };
}else  if (action.type === UPDATE_STICKY_STATE) {
   //preventing detail mode from opening until feature has been fully implemented
   return {
     ...state,
     'isSticky': action.payload.isSticky ,
     'isExpanded': action.payload.isExpanded
  };
}else  if (action.type === MERGE_MODE) {

    return {
      ...state,
      'mergeFilter': action.payload.mergeFilter,
      'branchesOpen': action.payload.branchesOpen
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
  } else if(action.type === IS_SYNCING){

    return {
      ...state,
      'isSyncing': action.payload.isSyncing,
    };
  } else if(action.type === IS_EXPORTING){

    return {
      ...state,
      'isExporting': action.payload.isExporting,
    };
  } else if(action.type === IS_PUBLISHING){

    return {
      ...state,
      'isPublishing': action.payload.isPublishing,
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
     'isPublushing': false,
     'isSyncing': false,
     'isExporting': false,
     'containerStatus': '',
     'modalVisible': '',
     'detailMode': false,
     'previousDetailMode': false
   };
 }else if(action.type === UPDATE_ALL){

   return {
     ...state,
     'labbookName': action.payload.labbookName,
     'owner': action.payload.owner
   };
 }

 return state;
};

/**
 * constants
 */
export const LOGIN_ERROR = 'LOGIN_ERROR';
export const LOGIN_CLEAR = 'LOGIN_CLEAR';
export const SHOW_LOGIN_PROMPT = 'SHOW_LOGIN_PROMPT';
export const LOGOUT = 'LOGOUT';



export default (
 state = {
   'error': false,
   'logout': false,
   'showLoginPrompt': false,
 },
 action
) => {
 if (action.type === LOGIN_ERROR) {
   return {
     ...state,
     error: action.payload.error
   };
 }else if(action.type === LOGIN_CLEAR){
   return {
     ...state,
     error: false
   };
 }else if(action.type === LOGOUT){
   return {
     ...state,
     logout: action.payload.logout
   };
  }else if(action.type === SHOW_LOGIN_PROMPT){
    return {
      ...state,
      showLoginPrompt: action.payload.showLoginPrompt
    };
  }

 return state;
};

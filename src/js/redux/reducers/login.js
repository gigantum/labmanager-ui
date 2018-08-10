/**
 * constants
 */
export const LOGIN_ERROR = 'LOGIN_ERROR';
export const LOGIN_CLEAR = 'LOGIN_CLEAR';
export const LOGOUT = 'LOGOUT';



export default (
 state = {
   'error': false,
   'logout': false,
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
  }

 return state;
};

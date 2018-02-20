import history from 'JS/history';
import auth0 from 'auth0-js';
import { AUTH_CONFIG } from './auth0-variables';
import RemoveUserIdentityMutation from 'Mutations/RemoveUserIdentityMutation'
//store
import store from 'JS/redux/store'


export default class Auth {
  auth0 = new auth0.WebAuth({
    domain: AUTH_CONFIG.domain,
    clientID: AUTH_CONFIG.clientId,
    redirectUri: AUTH_CONFIG.callbackUrl,
    audience:  AUTH_CONFIG.audience,
    responseType: 'token id_token',
    scope: 'openid profile email user_metadata'
  });

  constructor() {
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);

  }

  login() {
    this.auth0.authorize();
  }

  handleAuthentication() {

    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {

        this.setSession(authResult);

      } else if (err) {
        console.error(err);
      //  alert(`Error: ${err.error}. Check the console for further details.`);
      }
    });
  }

  setSession(authResult) {

    // Set the time that the access token will expire at
    let expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
    localStorage.setItem('family_name', authResult.idTokenPayload.family_name);
    localStorage.setItem('given_name', authResult.idTokenPayload.given_name);
    localStorage.setItem('email', authResult.idTokenPayload.email);
    localStorage.setItem('username', authResult.idTokenPayload.nickname);
    //redirect to labbooks when user logs in

    let storrageRoute = sessionStorage.getItem('CALLBACK_ROUTE')
    let route = storrageRoute !== '' ? storrageRoute : `/labbooks`

    history.replace(route)
  }

  logout() {

    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('family_name')
    localStorage.removeItem('given_name');
    localStorage.removeItem('email');
    localStorage.removeItem('username');
    RemoveUserIdentityMutation(()=>{
      //redirect to root when user logs out
      history.replace('/');
    })
  }

  isAuthenticated() {
    // Check whether the current time is past the
    // access token's expiry time
    let expiresAt = JSON.parse(localStorage.getItem('expires_at'));

    return new Date().getTime() < expiresAt;
  }
}

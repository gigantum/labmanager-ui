import React from 'react';
import { render } from 'react-dom';
import {unregister} from './registerServiceWorker';
import './../css/critical.scss';
import UserIdentity from 'JS/Auth/UserIdentity'
import Auth from 'JS/Auth/Auth'
// components
import Routes from './components/Routes';

const auth = new Auth();

let routeRef;

UserIdentity.getUserIdentity().then((response)=>{
  let expiresAt = JSON.stringify((new Date().getTime() * 1000) + new Date().getTime());
  let forceLoginScreen = true;

  if(response.data){

    if(response.data.userIdentity){
      localStorage.setItem('family_name', response.data.userIdentity.familyName);
      localStorage.setItem('given_name', response.data.userIdentity.givenName);
      localStorage.setItem('email', response.data.userIdentity.email);
      localStorage.setItem('username', response.data.userIdentity.username);
      localStorage.setItem('expires_at', expiresAt);

      forceLoginScreen = false;


    }else{
      localStorage.removeItem('family_name')
      localStorage.removeItem('given_name')
      localStorage.removeItem('email')
      localStorage.removeItem('username')
      localStorage.removeItem('expires_at')
      //routeRef._setForceLoginScreen(true)
    }
  }else{
    console.error(response)
  }

  render(
    <Routes
      auth={auth}
      forceLoginScreen={forceLoginScreen}

    />
    , document.getElementById('root') || document.createElement('div')

  );

})

unregister();

//vendor
import React, {Component} from 'react';
import store from 'JS/redux/store'
//assets
import gigantumLogo from 'Images/logos/gigantum.svg'

import Callback from 'JS/Callback/Callback';



let unsubscribe;
//import CreatePage from './components/CreatePage';
export default class Login extends Component {
  constructor(props){
  	super(props);
  	this.state = store.getState().login
  }

  /**
    subscribe to store to update state
  */
  componentDidMount() {

    unsubscribe = store.subscribe(() =>{

      this.storeDidUpdate(store.getState().login)
    })

  }
  /**
    unsubscribe from redux store
  */
  componentWillUnmount() {
    unsubscribe()
  }
  /**
    @param {string} route
    update route
  */
  goTo(route) {
    this.props.history.replace(`/labbooks`)
  }
  /**
    @param {}
    login through Auth0
  */
  login() {
    this.props.auth.login();
  }
  /**
    @param {}
    logout through Auth0
  */
  logout() {
    this.props.auth.logout();
  }

  render(){
    const { isAuthenticated } = this.props.auth;

    const errorType = sessionStorage.getItem('LOGIN_ERROR_TYPE'),
    errorDescription = sessionStorage.getItem('LOGIN_ERROR_DESCRIPTION')

    return(
      <div className="Login">

      {
        !isAuthenticated() && (
            <div className="Login__panel">
                {
                  errorType &&
                  <div className="LoginError">
                    <div className="Login__error">
                      <div className="Login__error-type">
                        <div className="Login__error-exclamation"></div>
                        <div>{errorType}</div>
                      </div>
                      <div className="Login__error-description">
                        {errorDescription}
                      </div>
                    </div>
                  </div>
                }
              <img
                alt="gigantum"
                className="Login__logo"
                src={gigantumLogo}
              />
              <button
                className="Login__button"
                onClick={this.login.bind(this)}>
                Log In
              </button>
            </div>
          )
      }


      </div>
    )
  }
}

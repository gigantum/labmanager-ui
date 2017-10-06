import React, {Component} from 'react';

//import CreatePage from './components/CreatePage';
export default class Login extends Component {
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
    return(
      <div className="Login">

      {
        !isAuthenticated() && (
            <div className="Login__panel flex flex--column justify--space-around">

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

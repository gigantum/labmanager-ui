import React, {Component} from 'react';

//import CreatePage from './components/CreatePage';
export default class Login extends Component {

  goTo(route) {
    this.props.history.replace(`/datasets`)
  }

  login() {
    this.props.auth.login();
  }

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

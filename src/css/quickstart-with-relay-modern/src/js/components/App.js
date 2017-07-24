import React, {Component} from 'react';

//import CreatePage from './components/CreatePage';
export default class App extends Component {

  goTo(route) {
    this.props.history.replace(`/${route}`)
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
      <div>

      {
        !isAuthenticated() && (
            <button
              className="btn-margin"
              onClick={this.login.bind(this)}
            >
              Log In
            </button>
          )
      }
      {
        isAuthenticated() && (
            <button
              className="btn-margin"
              onClick={this.logout.bind(this)}
            >
              Log Out
            </button>
          )
      }

      </div>
    )
  }
}

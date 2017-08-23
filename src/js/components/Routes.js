import React, {Component} from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Callback from './../Callback/Callback';
import Auth from './../Auth/Auth';
import history from './../history';
// components
import Home from './home/Home';
import App from './App';
import Header from './shared/Header';
import Labbook from './labbook/Labbook';
import BreadCrumbs from './breadCrumbs/BreadCrumbs';

//import Breadcrumbs from 'react-breadcrumbs'

const auth = new Auth();

const handleAuthentication = (nextState, replace) => {
  if (/access_token|id_token|error/.test(nextState.location.hash)) {
    auth.handleAuthentication();
  }
}

//import CreatePage from './components/CreatePage';
export default class Routes extends Component {

  constructor(props){
    super(props)
    this.state = {
      history: history
    }
  }

  login() {
    this.props.auth.login();
  }

  logout() {
    this.props.auth.logout();
  }

  render(){

    return(
      <div>



        <Router history={history}>

          <Switch>

            <Route
              path=""
              render={(location) => {return(
              <div className="Routes">
                <Header auth={auth} history={history}/>
                <BreadCrumbs location={location} history={history} />

                <Route
                  exact
                  path="/"
                  render={(props) =>
                    <Home
                      auth={auth}
                      {...props}
                    />
                  }
                />
                <Route
                  exact
                  path="/:id"
                  render={(props) =>
                    <Home
                      auth={auth}
                      {...props}
                    />
                  }
                />



                <Route
                  path="/labbooks/:labbookName/:labbookMenu"
                  render={(props) =>
                    <Labbook
                      auth={auth}
                      {...props}
                    />
                  }
                />

                <Route
                  path="/labbooks/:labbookName"
                  render={(props) =>
                    <Labbook
                      auth={auth}
                      {...props}
                    />
                  }
                />
                <Route
                  path="/callback"
                  render={(props) => {
                    handleAuthentication(props);
                    return (
                      <Callback
                        {...props}
                      />
                    )
                  }}
                />
              </div>
            )}}
           />
          </Switch>
        </Router>

      </div>
    )
  }
}

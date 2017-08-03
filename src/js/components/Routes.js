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
import BreadCrumbsContainer from './breadCrumbs/BreadCrumbs';
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

  componentWillUpdate(nextProps, nextState) {
    console.log(nextProps, nextState)
  }
  componentWillReceiveProps(nextProps) {
    console.log(nextProps)
  }

  componentWillMount() {
    console.log('sadd')
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
        <Header />


        <Router history={history}>

          <Switch>

            <Route
              path=""
              render={(location) => {console.log(location);return(
              <div>
                <BreadCrumbsContainer location={location} history={history} />

                <Route
                  exact
                  path="/"
                  render={(props) =>
                    <App
                      auth={auth}
                      {...props}
                    />
                  }
                />

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
                  path="/labbooks/:labbook_name"
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

//vendor
import React, {Component} from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Callback from 'JS/Callback/Callback';
import Auth from 'JS/Auth/Auth';
import history from 'JS/history';
import {QueryRenderer, graphql} from 'react-relay'
// components
import Home from 'Components/home/Home';
import Header from 'Components/shared/Header';
import Footer from 'Components/shared/Footer';
import Labbook from 'Components/labbook/Labbook';
import environment from 'JS/createRelayEnvironment'
import Loader from 'Components/shared/Loader'
//labbook query with notes fragment
export const LabbookQuery =  graphql`
  query RoutesQuery($name: String!, $owner: String!, $first: Int!, $cursor: String){
    labbook(name: $name, owner: $owner){
      id
      description
      ...Labbook_labbook
    }
  }`


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
                  path="/labbooks/:labbookName"
                  render={(parentProps) =>{

                      return (<QueryRenderer
                        environment={environment}
                        query={LabbookQuery}
                        variables={{name:parentProps.match.params.labbookName, owner: 'default', first: 20}}
                        render={({error, props}) => {

                          if(error){
                            return (<div>{error.message}</div>)
                          }
                          else if(props){

                            return (<Labbook
                              key={parentProps.match.params.labbookName}
                              auth={auth}
                              labbookName={parentProps.match.params.labbookName}
                              query={props.query}
                              labbook={props.labbook}
                              {...parentProps}
                            />)
                          }
                          else{
                            return (<Loader />)
                          }
                        }
                      }
                    />)
                  }

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
                <Footer/>
              </div>
            )}}
           />
          </Switch>
        </Router>

      </div>
    )
  }
}

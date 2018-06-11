//vendor
import React, {Component} from 'react';
import classNames from 'classnames';
import {BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'; //keep browser router, reloads page with Router in labbook view
import Callback from 'JS/Callback/Callback';
import Auth from 'JS/Auth/Auth';
import history from 'JS/history';
import {QueryRenderer, graphql} from 'react-relay'
import environment from 'JS/createRelayEnvironment'
// components
import Home from 'Components/home/Home';
import SideBar from 'Components/shared/SideBar';
import Footer from 'Components/shared/Footer';
import Prompt from 'Components/shared/Prompt';
import Labbook from 'Components/labbook/Labbook';
import Loader from 'Components/shared/Loader'
//
import store from 'JS/redux/store'

//labbook query with notes fragment
export const LabbookQuery =  graphql`
  query RoutesQuery($name: String!, $owner: String!, $first: Int!, $cursor: String, $hasNext: Boolean!){
    labbook(name: $name, owner: $owner){
      id
      description
      ...Labbook_labbook
    }
  }`

const auth = new Auth();


const handleAuthentication = (nextState, replace) => {
  if (/access_token|id_token|error/.test(nextState.location.hash)) {
    auth.handleAuthentication();
  }
}


export default class Routes extends Component {

  constructor(props){
    super(props)
    this.state = {
      history: history,
      hasError: false,
    }

    this.setRouteStore = this.setRouteStore.bind(this)

  }

  /**
    @param{string, string} owner,labbookName
    sets owner and labbookName in store for use in labbook queriesß
  */
  setRouteStore(owner, labbookName){

    store.dispatch({
      type: 'UPDATE_ALL',
      payload:{
        'owner': owner,
        labbookName: labbookName
      }
    })
  }
  /**
    @param{}
    logs user out in using auth0
  */
  login() {
    this.props.auth.login()
  }
  /**
    @param{}
    logs user out using auth0
  */
  logout() {
    this.props.auth.logout()
  }

  /**
    @param {Error, Object} error, info
    shows error message when runtime error occurs
  */
  componentDidCatch(error, info) {
    this.setState({hasError: true})
  }

  render(){
    if(!this.state.hasError){
      let authed = auth.isAuthenticated();
      let self = this
      let headerCSS = classNames({
        'Header': authed,
        'hidden': !authed
      })
      let routesCSS = classNames({
        'Routes__main': authed,
        'Routes__main-no-auth': !authed
      })
      return(

          <Router>

            <Switch>

              <Route
                path=""
                render={(location) => {return(
                <div className="Routes">
                  <div className={headerCSS}></div>
                  <SideBar
                    auth={auth} history={history}
                  />
                  <div className={routesCSS}>

                  <Route
                    exact
                    path="/"
                    render={(props) =>
                      <Home
                        history={history}
                        auth={auth}
                        {...props}
                      />
                    }
                  />


                  <Route
                    exact
                    path="/:id"
                    render={(props) =>
                      <Redirect to="/labbooks/local"/>
                    }
                  />

                  <Route
                    exact
                    path="/labbooks/:labbookSection"
                    render={(props) =>
                      <Home
                        history={history}
                        auth={auth}
                        {...props}
                      />
                    }
                  />

                  <Route
                    path="/labbooks/:owner/:labbookName"
                    auth={auth}
                    render={(parentProps) =>{

                        const labbookName = parentProps.match.params.labbookName;
                        const owner = parentProps.match.params.owner;

                        self.setRouteStore(owner, labbookName)

                        return (<QueryRenderer
                          environment={environment}
                          query={LabbookQuery}
                          variables={
                            {
                              name: parentProps.match.params.labbookName,
                              owner: parentProps.match.params.owner,
                              first: 2,
                              hasNext: false
                            }
                          }
                          render={({error, props}) => {

                            if(error){
                              console.log(error)
                              return (<div>{error.message}</div>)
                            }
                            else if(props){
                              if(props.errors){
                                return(<div>{props.errors[0].message}</div>)
                              }else{


                                return (<Labbook
                                  key={labbookName}
                                  auth={auth}
                                  labbookName={labbookName}
                                  query={props.query}
                                  labbook={props.labbook}
                                  owner={owner}
                                  {...parentProps}
                                />)
                              }
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

                  <Prompt
                    ref="prompt"
                  />
                  <Footer
                    ref="footer"
                    history={history}
                  />
                </div>
                </div>
              )}}
             />
            </Switch>
          </Router>
      )
    } else {
      return (
        <div className="Routes__error">

          <p>An error has occured. Please try refreshing the page.</p>
        </div>
      )
    }
  }
}

//vendor
import React, {Component} from 'react';
import {BrowserRouter as Router, Route, Switch } from 'react-router-dom'; //keep browser router, reloads page with Router in labbook view
import Callback from 'JS/Callback/Callback';
import Auth from 'JS/Auth/Auth';
import history from 'JS/history';
import {QueryRenderer, graphql} from 'react-relay'
import environment from 'JS/createRelayEnvironment'
// components
import Home from 'Components/home/Home';
import SideBar from 'Components/shared/SideBar';
import Footer from 'Components/shared/Footer';
import Labbook from 'Components/labbook/Labbook';
import Loader from 'Components/shared/Loader'
//
import store from 'JS/redux/store'

//labbook query with notes fragment
export const LabbookQuery =  graphql`
  query RoutesQuery($name: String!, $owner: String!, $first: Int!, $cursor: String){
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
      history: history
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

  render(){

    let self = this

    return(

        <Router history={history}>

          <Switch>

            <Route
              path=""
              render={(location) => {return(
              <div className="Routes">
                <div className="Header"></div>
                <SideBar
                  auth={auth} history={history}
                />
                <div className="Routes__main">

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
                    <Home
                      history={history}
                      auth={auth}
                      {...props}
                    />
                  }
                />

                <Route
                  exact
                  path="/:id/:labbookFilter"
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
                            first: 2
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
  }
}

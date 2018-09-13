//vendor
import React, {Component} from 'react';
import classNames from 'classnames';
import YouTube from 'react-youtube';
import {BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'; //keep browser router, reloads page with Router in labbook view
//history
import history from 'JS/history';
// components
import Home from 'Components/home/Home';
import SideBar from 'Components/shared/SideBar';
import Footer from 'Components/shared/footer/Footer';
import Prompt from 'Components/shared/Prompt';
import LabbookQueryContainer from 'Components/labbook/LabbookQueryContainer';
import Profile from 'Components/profile/Profile'
import Helper from 'Components/shared/Helper'
//store
import { setUpdateAll } from '/JS/redux/reducers/routes'
//config
import config from 'JS/config'


class Routes extends Component {

  constructor(props){
    super(props)
    this.state = {
      history: history,
      hasError: false,
      forceLoginScreen: this.props.forceLoginScreen,
      loadingRenew: this.props.loadingRenew,
      showYT: false,
      showDefaultMessage: true,
    }
    this._setForceLoginScreen = this._setForceLoginScreen.bind(this)
    this._flipDemoHeaderText = this._flipDemoHeaderText.bind(this)

  }
  /**
    @param {}
    calls flip header text function
  */
  componentDidMount(){
    this._flipDemoHeaderText();
  }
  /**
    @param {Error, Object} error, info
    shows error message when runtime error occurs
  */
  componentDidCatch(error, info) {
    this.setState({hasError: true})
  }
  /**
    @param {}
    changes text of demo header message
  */
  _flipDemoHeaderText(){
    let self = this;
    setTimeout(()=>{
      self.setState({showDefaultMessage: !this.state.showDefaultMessage})
      self._flipDemoHeaderText();
    }, 15000)
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
    @param {boolean} forceLoginScreen
    sets state of forceloginscreen
  */
  _setForceLoginScreen(forceLoginScreen) {
    if(forceLoginScreen !== this.state.forceLoginScreen){
      this.setState({forceLoginScreen})
    }
  }


  render(){
    if(!this.state.hasError){
      let authed = this.props.auth.isAuthenticated();
      let self = this
      let headerCSS = classNames({
        'Header': authed,
        'hidden': !authed,
        'is-demo': window.location.hostname === config.demoHostName,
      })
      let routesCSS = classNames({
        'Routes__main': authed,
        'Routes__main-no-auth': !authed
      })

      let demoText = "You're using the Gigantum web demo. Data is wiped hourly. To continue using Gigantum "

      return(

          <Router>

            <Switch>

              <Route
                path=""
                render={(location) => {return(
                <div className="Routes">
                  {
                    window.location.hostname === config.demoHostName &&
                    (this.state.showDefaultMessage ?
                    <div
                      id="demo-header"
                      class="demo-header"
                    >
                      {demoText}
                      <a
                        href="http://gigantum.com/download"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        download the Gigantum client.
                      </a>
                    </div>
                    :
                    <div
                      id="demo-header"
                      class="demo-header"
                    >
                      Curious what can Gigantum do for you? &nbsp;
                      <a onClick={() => this.setState({showYT: true})}>
                         Watch this overview video.
                      </a>
                    </div>)
                  }
                  {
                    this.state.showYT &&
                      <div
                        id="yt-lightbox"
                        className="yt-lightbox"
                        onClick={() => this.setState({showYT: false})}
                      >
                      <YouTube
                        opts={{height: '576', width: '1024'}}
                        className="yt-frame"
                        videoId="S4oW2CtN500"
                      />
                    </div>
                  }
                  <div className={headerCSS}></div>
                  <SideBar
                    auth={this.props.auth} history={history}
                  />
                  <div className={routesCSS}>

                  <Route
                    exact
                    path="/"
                    render={(props) =>
                      <Home
                        loadingRenew={this.state.loadingRenew}
                        history={history}
                        auth={this.props.auth}
                        {...props}
                      />
                    }
                  />

                  <Route
                    exact
                    path="/:id"
                    render={(props) =>
                      <Redirect to="/projects/local"/>
                    }
                  />

                  <Route
                    exact
                    path="/labbooks/:section"
                    render={(props) =>
                      <Redirect to="/projects/local"/>
                    }
                  />

                  <Route
                    exact
                    path="/projects/:labbookSection"
                    render={(props) =>


                        <Home
                          loadingRenew={this.state.loadingRenew}
                          history={history}
                          auth={this.props.auth}
                          {...props}
                        />
                      }
                    />

                    <Route
                      path="/projects/:owner/:labbookName"
                      auth={this.props.auth}
                      render={(parentProps) =>{
                          if(this.props.forceLoginScreen){
                            return <Redirect to="/login" />
                          }
                          const labbookName = parentProps.match.params.labbookName;
                          const owner = parentProps.match.params.owner;

                          setUpdateAll(owner, labbookName)

                          return (
                            <LabbookQueryContainer
                              labbookName={parentProps.match.params.labbookName}
                              owner={parentProps.match.params.owner}
                              auth={this.props.auth}
                              history={history}
                              {...this.props}
                              {...parentProps}
                            /> )
                      }

                      }
                    />

                    <Route
                      path="/profile"
                      render={(props)=>{
                        return(
                          <Profile

                          />
                        )
                      }}
                    />


                    <Helper />

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


export default Routes

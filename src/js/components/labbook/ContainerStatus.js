//vendor
import React, { Component } from 'react'
import {
  QueryRenderer,
  graphql
} from 'react-relay'
//mutations
import StopContainerMutation from 'Mutations/StopContainerMutation'
import StartContainerMutation from 'Mutations/StartContainerMutation'
import environment from 'JS/createRelayEnvironment'
//store
import reduxStore from 'JS/redux/store'

const containerStatusQuery = graphql`
  query ContainerStatusQuery($name: String!, $owner: String!, $first: Int!){
  labbook(name: $name, owner: $owner){
    id
    description
    environment{
      containerStatus
      imageStatus
    }
    activityRecords(first: $first){
      edges{
        node{
          id
        }
      }
    }
  }
}
`

export default class ContainerStatus extends Component {
  constructor(props){
  	super(props);
    const {owner, labbookName} = reduxStore.getState().routes
    this.state = {
      'status': "",
      'building': this.props.isBuilding,
      'secondsElapsed': 0,
      'containerStatus': props.containerStatus,
      'imageStatus': props.imageStatus,
      'pluginsMenu': false,
      'containerMenuOpen': false,
      owner,
      labbookName
    }

    this._tick = this._tick.bind(this)
    this._checkJupyterStatus = this._checkJupyterStatus.bind(this)
    this._getContainerStatusText = this._getContainerStatusText.bind(this)
    this._openCloseContainer = this._openCloseContainer.bind(this)
    this._closePopupMenus = this._closePopupMenus.bind(this)
  }
  /**
  *  @param {}
  *  set containerStatus secondsElapsed state by iterating
  *  @return {string}
  */
  _tick = () => {
    this.setState({secondsElapsed: this.state.secondsElapsed + 1});
  }
  /**
  *  @param {}
  *  set tick interval
  *  @return {string}
  */
  componentDidMount(){

    let status = this._getContainerStatusText(
      {
      containerStatus:this.props.containerStatus, imageStatus: this.props.imageStatus
      })
    const hasLabbookId = reduxStore.getState().overview.containerStates[this.props.labbookId]

    if(hasLabbookId){
      const storeStatus = reduxStore.getState().overview.containerStates[this.props.labbookId]

      if(storeStatus !== status){
        reduxStore.dispatch({
          type: 'UPDATE_CONTAINER_STATE',
          payload:{
            labbookId: this.props.labbookId,
            containerState: status
          }
        })
      }
    }

    let intervalInSeconds = 2 * 1000 * 1000
    this.interval = setInterval(this._tick, intervalInSeconds);

    window.addEventListener("click", this._closePopupMenus)
  }
  /**
   *  @param {event} evt
   *  closes menu box when menu is open and the menu has not been clicked on
   *
  */
  _closePopupMenus(evt){

    let containerMenuClicked = (evt.target.className.indexOf('ContainerStatus__container-state') > -1) ||
    (evt.target.className.indexOf('ContainerStatus__button-menu') > -1)

    if(!containerMenuClicked &&
    this.state.containerMenuOpen){
      this.setState({
        containerMenuOpen: false
      })
    }

    let pluginsMenuClicked = (evt.target.className.indexOf('ContainerStatus__plugins') > -1)
    if(!pluginsMenuClicked && this.state.pluginsMenu){
      this.setState({
        pluginsMenu: false
      })
    }
  }

  /**
  *  @param {string} nextProps
  *  update container state before rendering new props
  */
  componentWillReceiveProps(nextProps) {

    let status = this._getContainerStatusText(nextProps.containerStatus, nextProps.imageStatus)
    const hasLabbookId = reduxStore.getState().overview.containerStates[this.props.labbookId]

    if(hasLabbookId){
      const storeStatus = reduxStore.getState().overview.containerStates[this.props.labbookId]

      if(storeStatus !== status){
        reduxStore.dispatch({
          type: 'UPDATE_CONTAINER_STATE',
          payload:{
            labbookId: this.props.labbookId,
            containerState: this._getContainerStatusText({containerStatus:nextProps.containerStatus, image:nextProps.imageStatus})
          }
        })
      }

    }

    this.setState({
      'containerStatus': nextProps.containerStatus,
      'imageStatus': nextProps.imageStatus
    })
  }
  /**
  *  @param {}
  *  clear interval to stop polling and clean up garbage
  */
  componentWillUnmount() {
    //memory clean up
    clearInterval(this.interval);
    window.removeEventListener("click", this._closePopupMenus)
  }

  /**
    @param {}
    set containerStatus secondsElapsed state by iterating
    @return {string}
  */
  _checkJupyterStatus = () => {
    //update this when juphyter can accept cors

    setTimeout(function(){
      window.open('http://localhost:8888', '_blank')
    },5000)
  }
  /**
    @param {string, string} containerStatus,imageStatus -
    get status by mixing containrSatus imagesStatus and state.status
    @return {string}
  */
  _getContainerStatusText = ({containerStatus, imageStatus}) => {

    let status = (containerStatus === 'RUNNING') ? 'Open' : containerStatus;
    status = (containerStatus === 'NOT_RUNNING') ? 'Closed' : status;
    status = (imageStatus === "BUILD_IN_PROGRESS") ? 'Building' : status;

    status = ((status === 'Closed') && (this.state.status === "Starting")) ? "Starting" : status;
    status = ((status === 'Open') && (this.state.status === "Stopping")) ? "Stopping" : status;

    return status;
  }
  /**
    @param {}
    triggers stop container mutation
  */
  _stopContainerMutation(){

    StopContainerMutation(
      this.state.labbookName,
      this.state.owner,
      'clientMutationId',
      (error) =>{

        if(error){
          console.log(error)
          reduxStore.dispatch({
            type: 'ERROR_MESSAGE',
            payload:{
              message: `There was a problem stopping ${this.state.labbookName} container`,
              messagesList: error
            }
          })
        }else{
          console.log('stopped container')
        }

      }
    )
  }

  /**
    @param {}
    triggers start container mutation
  */
  _startContainerMutation(){

    StartContainerMutation(
      this.state.labbookName,
      this.state.owner,
      'clientMutationId',
      (error) =>{

        if(error){
          reduxStore.dispatch({
            type: 'ERROR_MESSAGE',
            payload:{
              message: `There was a problem starting ${this.state.labbookName} container`,
              messagesList: error
            }
          })
        }else{
          console.log('started container')
        }
      }
    )
  }

  /**
    @param {object, string} event,status -
    trigger mutatuion to stop or start container depdending on the state
  */
  _openCloseContainer = (evt, status) =>{

      if(status === 'Open'){

        this.setState({
          status: 'Stopping',
          contanerMenuOpen: false
        });
        this._stopContainerMutation()

      }else if(status === 'Closed'){

        this.setState({
          status: 'Starting',
          contanerMenuOpen: false
        })
        this._startContainerMutation()

      }else{
        console.log('container is mutating')
      }
  }

  render(){

    return(
      <QueryRenderer
        variables={{
          'owner': this.state.owner,
          'name': this.state.labbookName,
          'first': Math.floor(Math.random() * 10000)
          }
        }
        environment={environment}
        query={containerStatusQuery}
        render={({error, props}) => {

          if(error){
            console.error(error)
            return(this._errorMessage(error))
          }else if(props){

            let status = this._getContainerStatusText(props.labbook.environment)
            return(this._containerStatus(status, 'setStatus')
            )
          } else{

            let status = this._getContainerStatusText(this.state)

            return (this._containerStatus(status, 'tempStatus'))
          }
        }
      }

      />
    )
  }

  _openPluginMenu(){
    this.setState({
      pluginsMenu: !this.state.pluginsMenu
    })
  }

  _showMenu(){
    this.setState({
      containerMenuOpen: !this.state.containerMenuOpen
    })
  }

  _containerStatus(status, key){
    let jupyterLink = (window.location.hostname.indexOf('localhost') > -1) ? window.location.protocol + '//' + window.location.hostname + ':8888' : 'http://jupyter.gigantum.io'

    let containerStatusCss = this.state.containerMenuOpen ? "ContainerStatus__container-state--menu-open " : "ContainerStatus__container-state ";
    return(
      <div className="ContainerStatus flex flex--row">
        { (status === 'Open') &&
            <div className="ContainerStatus__plugins">
                <div
                  className="fa ContainerStatus__plugins-button"
                  onClick={()=>{this._openPluginMenu()}}>
                </div>
                <div className={this.state.pluginsMenu ? 'ContainerStatus__plugins-menu-arrow': 'ContainerStatus__plugins-menu-arrow hidden'} ></div>
                <div
                  className={this.state.pluginsMenu ? 'ContainerStatus__plugins-menu': 'ContainerStatus__plugins-menu hidden'}>
                  <div className="ContainerStatus__plugins-title">Launch</div>
                  <ul className="ContainerStatus__plugins-list">
                    <li className="ContainerStatus__plugins-list-item">
                      <a
                        className="ContainerStatus__plugins-item jupyter-icon"
                        href={jupyterLink}
                        target="_blank"
                        rel="noopener noreferrer">
                          Jupyter
                      </a>
                    </li>
                  </ul>
                </div>
            </div>
        }
        <div
          onClick={(evt) => this._showMenu()}
          key={key}
          className={containerStatusCss + ((this.props.isBuilding) ? 'Building' : status)}>
          {this.props.isBuilding ? 'Building' : status}
        </div>
        {
          this.state.containerMenuOpen &&
          <div className="ContainerStatus__menu-pointer"></div>
        }
        {
          this.state.containerMenuOpen &&
          <div className="ContainerStatus__button-menu">
              {
                (status === "Open") &&
                <button onClick={(evt) => this._openCloseContainer(evt, status)}>Stop Container</button>
              }

              {
                (status === "Closed") &&
                <button onClick={(evt) => this._openCloseContainer(evt, status)}>Start Container</button>
              }
          </div>
        }
      </div>)
  }

  _errorMessage(error){
      return(<div>{error.message}</div>)
  }
}

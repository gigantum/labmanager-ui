//vendor
import React, { Component } from 'react'
import {
  QueryRenderer,
  graphql
} from 'react-relay'
import classNames from 'classnames'
//mutations
import StopContainerMutation from 'Mutations/StopContainerMutation'
import StartContainerMutation from 'Mutations/StartContainerMutation'
import StartDevToolMutation from 'Mutations/container/StartDevToolMutation'
import BuildImageMutation from 'Mutations/BuildImageMutation'
//environment
import environment from 'JS/createRelayEnvironment'
//store
import store from 'JS/redux/store'

let unsubscribe;

const containerStatusQuery = graphql`
  query ContainerStatusQuery($name: String!, $owner: String!, $first: Int!){
  labbook(name: $name, owner: $owner){
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

    const {owner, labbookName} = store.getState().routes

    let state = {
      'status': "",
      'building': this.props.isBuilding,
      'secondsElapsed': 0,
      'containerStatus': props.containerStatus,
      'imageStatus': props.imageStatus,
      'pluginsMenu': false,
      'containerMenuRunning': false,
      'isMouseOver': false,
      owner,
      labbookName
    }

    this.state = state;

    this._tick = this._tick.bind(this)
    this._checkJupyterStatus = this._checkJupyterStatus.bind(this)
    this._getContainerStatusText = this._getContainerStatusText.bind(this)
    this._openCloseContainer = this._openCloseContainer.bind(this)
    this._closePopupMenus = this._closePopupMenus.bind(this)
    this._openDevToolMuation = this._openDevToolMuation.bind(this)
    this._rebuildContainer = this._rebuildContainer.bind(this)
  }

  /**
  *  @param {}
  *  clear interval to stop polling and clean up garbage
  */
  componentWillUnmount() {
    unsubscribe()
    //memory clean up
    window.removeEventListener("click", this._closePopupMenus)
  }

  componentDidUpdate(prevProps, prevState) {
    if(prevState.secondsElapsed !== this.state.secondsElapsed){
      let self = this
      let intervalInSeconds = 3 * 1000

      setTimeout(function(){
        self._tick()
      }, intervalInSeconds);
    }
  }
  /**
    @param {object} footer
    unsubscribe from redux store
  */
  storeDidUpdate = (containerStatusStore) => {

    if(this.state.containerMenuRunning !== containerStatusStore.containerMenuRunning){

      if(((containerStatusStore.status === 'Stopped') || containerStatusStore.status === 'Running') || (containerStatusStore.status === 'Build Failed')){

        this.setState({containerMenuRunning: containerStatusStore.containerMenuRunning}); //triggers  re-render when store updates
      }
    }
  }
  /**
  *  @param {}
  *  set containerStatus secondsElapsed state by iterating
  *  @return {string}
  */
  _tick(){
    this.setState({secondsElapsed: this.state.secondsElapsed + 3});
  }
  /**
  *  @param {}
  *  set tick interval
  *  @return {string}
  */
  componentDidMount(){
    let self = this
    let intervalInSeconds = 3 * 1000
    setTimeout(function(){
      self._tick()
    }, intervalInSeconds);
    // let intervalInSeconds = 3 * 1000
    // setTimeout(this._tick, intervalInSeconds);

    unsubscribe = store.subscribe(() =>{

      this.storeDidUpdate(store.getState().containerStatus)
    })

    let status = this._getContainerStatusText(
      {
      containerStatus:this.props.containerStatus, imageStatus: this.props.imageStatus
      })
    const hasLabbookId = store.getState().overview.containerStates[this.props.labbookId]

    if(hasLabbookId){
      const storeStatus = store.getState().overview.containerStates[this.props.labbookId]

      if(storeStatus !== status){
        store.dispatch({
          type: 'UPDATE_CONTAINER_STATE',
          payload:{
            labbookId: this.props.labbookId,
            containerState: status
          }
        })
      }
    }

    window.addEventListener("click", this._closePopupMenus)
  }
  /**
   *  @param {event} evt
   *  closes menu box when menu is open and the menu has not been clicked on
   *
  */
  _closePopupMenus(evt){

    let containerMenuClicked = (evt.target.className.indexOf('ContainerStatus__container-state') > -1) ||
      (evt.target.className.indexOf('ContainerStatus__button-menu') > -1) ||
      (evt.target.className.indexOf('PackageDependencies__button') > -1) ||
      (evt.target.className.indexOf('CustomDependencies__button') > -1)

    if(!containerMenuClicked &&
    this.state.containerMenuRunning){
      store.dispatch({
        type: 'UPDATE_CONTAINER_MENU_VISIBILITY',
        payload: {
          containerMenuRunning: false
        }
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
    const hasLabbookId = store.getState().overview.containerStates[this.props.labbookId]

    if(hasLabbookId){
      const storeStatus = store.getState().overview.containerStates[this.props.labbookId]

      if(storeStatus !== status){
        store.dispatch({
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

    let status = (containerStatus === 'RUNNING') ? 'Running' : containerStatus;
    status = (containerStatus === 'NOT_RUNNING') ? 'Stopped' : status;
    status = (imageStatus === "BUILD_IN_PROGRESS") ? 'Building' : status;
    status = (imageStatus === "BUILD_FAILED") ? 'Build Failed' : status;

    status = ((status === 'Stopped') && (this.state.status === "Starting")) ? "Starting" : status;
    status = ((status === 'Running') && (this.state.status === "Stopping")) ? "Stopping" : status;

    if(store.getState().containerStatus.status !== status){
      store.dispatch({
        type: 'UPDATE_CONTAINER_STATUS',
        payload: {
          status: status
        }
      })
    }


    if((status !== 'Stopped') && (status !== 'Build Failed')){
      store.dispatch({
        type: 'CLOSE_ENVIRONMENT_MENUS',
        payload:{
        }
      })
    }

    return status;
  }
  /**
    @param {}
    triggers stop container mutation
  */
  _stopContainerMutation(){
    store.dispatch({
      type: 'UPDATE_CONTAINER_MENU_VISIBILITY',
      payload: {
        containerMenuRunning: false
      }
    })

    StopContainerMutation(
      this.state.labbookName,
      this.state.owner,
      'clientMutationId',
      (response, error) =>{

        if(error){
          console.log(error)
          store.dispatch({
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
    store.dispatch({
      type: 'CLOSE_ENVIRONMENT_MENUS',
      payload:{
      }
    })


    store.dispatch({
      type: 'UPDATE_CONTAINER_MENU_VISIBILITY',
      payload: {
        containerMenuRunning: false
      }
    })
    StartContainerMutation(
      this.state.labbookName,
      this.state.owner,
      'clientMutationId',
      (response, error) =>{

        if(error){
          store.dispatch({
            type: 'ERROR_MESSAGE',
            payload:{
              message: `There was a problem starting ${this.state.labbookName} container`,
              messagesList: error
            }
          })
        }else{
          console.log('started container')
          store.dispatch({
            type: 'CLOSE_ENVIRONMENT_MENUS',
            payload:{
            }
          })


        }
      }
    )
  }
  /**
    @param {}
    mutation to trigger opening of development tool
  */
  _openDevToolMuation(developmentTool){
    const {owner, labbookName} = store.getState().routes
    store.dispatch({
      type: 'INFO_MESSAGE',
      payload:{
        message: `Starting ${developmentTool}`,
      }
    })
    StartDevToolMutation(
      owner,
      labbookName,
      developmentTool,
      (response, error)=>{
          if(response){

            let path = response.startDevTool.path.replace('0.0.0.0', window.location.hostname)
            window.open(path, '_blank')
          }
          if(error){
            store.dispatch({
              type: 'ERROR_MESSAGE',
              payload: {
                message: "Error Starting Dev tool",
                messagesList: error
              }
            })
          }
      }

    )
  }

  /**
    @param {object, string} event,status -
    trigger mutatuion to stop or start container depdending on the state
  */
  _openCloseContainer = (evt, status) =>{

      if(status === 'Running'){

        this.setState({
          status: 'Stopping',
          contanerMenuRunning: false
        });
        this._stopContainerMutation()

      }else if(status === 'Stopped'){

        this.setState({
          status: 'Starting',
          contanerMenuRunning: false
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

  _rebuildContainer(){
    store.dispatch({
      type: 'UPDATE_CONTAINER_MENU_VISIBILITY',
      payload: {
        containerMenuRunning: false
      }
    })
    let {labbookName, owner} = this.state
    BuildImageMutation(
      labbookName,
      owner,
      true,
      (response, error)=>{
          if(error){
            console.log(error)
          }
      }
    )
  }

  _openPluginMenu(){
    this.setState({
      pluginsMenu: !this.state.pluginsMenu
    })
  }

  _showMenu(){
    store.dispatch({
      type: 'UPDATE_CONTAINER_MENU_VISIBILITY',
      payload: {
        containerMenuRunning: !this.state.containerMenuRunning
      }
    })
  }
  /**
    @param {boolean} value
    trigger mutatuion to stop or start container depdending on the state
  */
  _setMouseOverState(value){
    console.log(value)
    this.setState({'isMouseOver': value})
  }
  /**
    @param {string} status
    trigger mutatuion to stop or start container depdending on the state
    @return {string} newStatus
  */
  _getStatusText(status){
    let newStatus = status

    newStatus =this.state.isMouseOver && (status === 'Running') ? 'Stop' : newStatus
    newStatus = this.state.isMouseOver && (status === 'Stopped') ? 'Run' : newStatus
    newStatus = this.state.isMouseOver && (status === 'Build Failed') ? 'Rebuild' : newStatus

    newStatus = this.state.isBuilding ? 'Building' : newStatus
    console.log(newStatus, status)
    return newStatus;
  }

  /**
   *
   *
   */

  _containerAction(status, evt){
    if(status === "Running"){
       this._openCloseContainer(evt, status)
    }

    if(status === "Stopped"){
      this._openCloseContainer(evt, status)
    }

    if(status === "Build Failed"){
      this._rebuildContainer(evt, status)
    }
  }

  _containerStatus(status, key){
    const containerStatusCss = classNames({
      'ContainerStatus__container-state--menu-open': this.state.containerMenuRunning,
      'ContainerStatus__container-state': !this.state.containerMenuRunning,
      'Building': this.props.isBuilding,
      [status]: !this.props.isBuilding
    })

    const containerMenuIconCSS = classNames({
        'ContainerStatus__plugins-menu-arrow': true,
        'hidden': !this.state.pluginsMenu
    })

    const containerMenuCSS = classNames({
        'ContainerStatus__plugins-menu': true,
        'hidden': !this.state.pluginsMenu
    })

    return(
      <div className="ContainerStatus flex flex--row">
        { (status === 'Running') &&
            <div className="ContainerStatus__plugins">
                <div
                  className="fa jupyter-icon ContainerStatus__plugins-button"
                  onClick={()=>{this._openDevToolMuation(this.props.base.developmentTools[0])}}>
                  Open Jupyter
                </div>
                <div className={containerMenuIconCSS} ></div>
                <div
                  className={containerMenuCSS}>
                  <div className="ContainerStatus__plugins-title">Launch</div>
                  <ul className="ContainerStatus__plugins-list">
                    {

                      this.props.base.developmentTools.map((developmentTool) =>{
                        return(
                          <li
                            key={developmentTool}
                            className="ContainerStatus__plugins-list-item">
                            <button
                              className="ContainerStatus__button--flat jupyter-icon"
                              onClick={()=>this._openDevToolMuation(developmentTool)}
                              rel="noopener noreferrer">
                                {developmentTool}
                            </button>
                          </li>
                        )
                      })
                    }
                  </ul>
                </div>
            </div>
        }
        <div
          onClick={(evt) => this._containerAction(status, key)}
          key={key}
          className={containerStatusCss}
          onMouseOver={()=>{this._setMouseOverState(true)}}
          onMouseOut ={()=>{this._setMouseOverState(false)}}>
          {this._getStatusText(status)}
        </div>
        {
          this.state.containerMenuRunning &&
          <div className="ContainerStatus__menu-pointer"></div>
        }
        {
          this.state.containerMenuRunning &&
          <div className="ContainerStatus__button-menu">

          </div>
        }
      </div>)
  }

  _errorMessage(error){
      return(<div>{error.message}</div>)
  }
}

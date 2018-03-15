//vendor
import React, { Component } from 'react'
import classNames from 'classnames'
//mutations
import StopContainerMutation from 'Mutations/StopContainerMutation'
import StartContainerMutation from 'Mutations/StartContainerMutation'
import StartDevToolMutation from 'Mutations/container/StartDevToolMutation'
import BuildImageMutation from 'Mutations/BuildImageMutation'
//store
import store from 'JS/redux/store'
//
import FetchContainerStatus from './fetchContainerStatus'

let unsubscribe;

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
      'containerMenuOpen': false,
      'isMouseOver': false,
      'rebuildAttempts': 0,
      owner,
      labbookName
    }

    this.state = state;

    this._checkJupyterStatus = this._checkJupyterStatus.bind(this)
    this._getContainerStatusText = this._getContainerStatusText.bind(this)
    this._containerAction = this._containerAction.bind(this)
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

  componentWillUpdate(nextProps, nextState) {
    // console.log(nextProps)
    // this.setState({
    //   'containerStatus': nextProps.containerStatus,
    //   'imageStatus': nextProps.imageStatus
    // })
  }

  componentDidUpdate(prevProps, prevState) {
    if(prevState.secondsElapsed !== this.state.secondsElapsed){
      let self = this
      let intervalInSeconds = 3 * 1000

      setTimeout(function(){
        self._fetchStatus()
      }, intervalInSeconds);
    }
  }
  /**
    @param {object} footer
    unsubscribe from redux store
  */
  storeDidUpdate = (containerStatusStore) => {

    if(this.state.containerMenuOpen !== containerStatusStore.containerMenuOpen){
        this.setState({containerMenuOpen: containerStatusStore.containerMenuOpen, containerMenuWarning: containerStatusStore.containerMenuWarning}); //triggers  re-render when store updates
    }
  }
  /**
  *  @param {}
  *  set fetch interval
  *  @return {string}
  */
  componentDidMount(){
    let self = this
    let intervalInSeconds = 3 * 1000
    setTimeout(function(){
      self._fetchStatus()
    }, intervalInSeconds);

    unsubscribe = store.subscribe(() =>{

      this.storeDidUpdate(store.getState().environment)
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

  _fetchStatus(){
    const {owner, labbookName} = store.getState().routes
    const state = this.state
    const self = this
    FetchContainerStatus.getContainerStatus(owner, labbookName).then((response, error)=>{

      const {environment} = response.labbook

      if((state.containerStatus !== environment.containerStatus) || (state.imageStatus !== environment.imageStatus)){
        self.setState({
          'imageStatus': environment.imageStatus,
          'containerStatus': environment.containerStatus
        })
      }

      setTimeout(()=>{
        self._fetchStatus()
      }, 3 * 1000)
    })
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
    this.state.containerMenuOpen){
      store.dispatch({
        type: 'UPDATE_CONTAINER_MENU_VISIBILITY',
        payload: {
          containerMenuOpen: false
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
    status = (imageStatus === "DOES_NOT_EXIST") ? 'Rebuild Required' : status;

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
        containerMenuOpen: false
      }
    })

    let self = this;

    StopContainerMutation(
      this.state.labbookName,
      this.state.owner,
      'clientMutationId',
      (response, error) =>{

        self.setState({
          'imageStatus': 'EXISTS',
          'containerStatus': 'NOT_RUNNING',
          'status': ''
        })

        if(error){
          console.log(error)
          store.dispatch({
            type: 'ERROR_MESSAGE',
            payload:{
              message: `There was a problem stopping ${self.state.labbookName} container`,
              messageBody: error
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

    let self = this;

    store.dispatch({
      type: 'CLOSE_ENVIRONMENT_MENUS',
      payload:{
      }
    })

    store.dispatch({
      type: 'UPDATE_CONTAINER_MENU_VISIBILITY',
      payload: {
        containerMenuOpen: false
      }
    })

    StartContainerMutation(
      this.state.labbookName,
      this.state.owner,
      'clientMutationId',
      (response, error) =>{

        self.setState({
          'imageStatus': 'EXISTS',
          'containerStatus': 'RUNNING',
          'status': ''
        })

        if(error){
          store.dispatch({
            type: 'ERROR_MESSAGE',
            payload:{
              message: `There was a problem starting ${this.state.labbookName} container`,
              messageBody: error
            }
          })

          if(error[0].message.indexOf('404 Client Error') > -1){
            self._rebuildContainer()
          }

        }else{

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
          if(response.startDevTool){

            let path = response.startDevTool.path.replace('0.0.0.0', window.location.hostname)
            window.open(path, '_blank')
          }
          if(error){
            store.dispatch({
              type: 'ERROR_MESSAGE',
              payload: {
                message: "Error Starting Dev tool",
                messageBody: error
              }
            })
          }
      }

    )
  }

  /**
    @param {string} status
    trigger mutatuion to stop or start container depdending on the state
    @return {string} newStatus
   */
  _containerAction(status, evt){

    if(status === "Stop"){
      this.setState({
        status: 'Stopping',
        contanerMenuRunning: false
      });
      this._stopContainerMutation()
    }else if(status === "Run"){
      this.setState({
        status: 'Starting',
        contanerMenuRunning: false
      })
      this._startContainerMutation()
    }else if((status === "Rebuild") || (status === "Rebuild Required")){

      this.setState({
        status: "Building",
        contanerMenuRunning: false
      });

      this._rebuildContainer(evt, status)
    }




  }

  /**
    @param {} value
    shows message plugin menu
  */
  _openPluginMenu(){
    this.setState({
      pluginsMenu: !this.state.pluginsMenu
    })
  }
  /**
    @param {} value
    shows message to stop container
  */
  _showMenu(){
    store.dispatch({
      type: 'UPDATE_CONTAINER_MENU_VISIBILITY',
      payload: {
        containerMenuOpen: !this.state.containerMenuOpen
      }
    })
  }
  /**
    @param {boolean} value
    trigger mutatuion to stop or start container depdending on the state
  */
  _setMouseOverState(value){

    this.setState({'isMouseOver': value})
  }
  /**
    @param {string} status
    trigger mutatuion to stop or start container depdending on the state
    @return {string} newStatus
  */
  _getStatusText(status){
    let newStatus = status

    newStatus = this.state.isMouseOver && (status === 'Running') ? 'Stop' : newStatus
    newStatus = this.state.isMouseOver && (status === 'Stopped') ? 'Run' : newStatus
    newStatus = this.state.isMouseOver && (status === 'Build Failed') ? 'Rebuild' : newStatus
    newStatus = this.state.isMouseOver && (status === 'Rebuild Required') ? 'Rebuild' : newStatus

    newStatus = this.state.isBuilding ? 'Building' : newStatus

    return newStatus;
  }
  /**
    @param {}
    triggers build image mutations with force === true
    @return {}
  */
  _rebuildContainer(){
    store.dispatch({
      type: 'UPDATE_CONTAINER_MENU_VISIBILITY',
      payload: {
        containerMenuOpen: false
      }
    })
    let {labbookName, owner} = this.state
    let self = this
    BuildImageMutation(
      labbookName,
      owner,
      true,
      (response, error)=>{
          if(error){
            console.log(error)
          }
          self.setState({rebuildAttempts: this.state.rebuildAttempts++})
          if((this.state.status === 'Starting') && (this.state.rebuildAttempts < 1)){
            self._startContainerMutation()
          }else{
            self.setState({
              rebuildAttempts: 0,
              'status': ''
            })
          }
      }
    )
  }


  render(){
    let status = this._getContainerStatusText(this.state)
    return(
        this._containerStatusJSX(status, 'setStatus')
    )
  }

  _containerStatusJSX(status, key){
    const containerStatusCss = classNames({
      'ContainerStatus__container-state--menu-open': this.state.containerMenuOpen,
      'ContainerStatus__container-state': !this.state.containerMenuOpen,
      'Building': this.props.isBuilding,
      [status]: !this.props.isBuilding,
      'ContainerStatus__container-state--expanded': this.state.isMouseOver
    })

    const containerMenuIconCSS = classNames({
        'ContainerStatus__plugins-menu-arrow': true,
        'hidden': !this.state.pluginsMenu
    })

    const containerMenuCSS = classNames({
        'ContainerStatus__plugins-menu': true,
        'hidden': !this.state.pluginsMenu
    })

    const jupyterButtonCss = classNames({
      'ContainerStatus__plugins-button': true,
      'jupyter-icon': true,
      'ContainerStatus__button--bottom': this.state.isMouseOver
    })
    const textStatus = this._getStatusText(status)
    return(
      <div className="ContainerStatus flex flex--row">
        { (status === 'Running') &&
            <div className="ContainerStatus__plugins">
                <div
                  className={jupyterButtonCss}
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
                              className={jupyterButtonCss}
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
          onClick={(evt) => this._containerAction(textStatus, key)}
          key={key}
          className={containerStatusCss}
          onMouseOver={()=>{this._setMouseOverState(true)}}
          onMouseOut ={()=>{this._setMouseOverState(false)}}>
          {this._getStatusText(textStatus)}
        </div>
        {
          this.state.containerMenuOpen &&
          <div className="ContainerStatus__menu-pointer"></div>
        }
        {
          this.state.containerMenuOpen &&
          <div className="ContainerStatus__button-menu">
            {this.state.containerMenuWarning}
          </div>
        }
      </div>)
  }

  _errorMessage(error){
      return(<div>{error.message}</div>)
  }
}

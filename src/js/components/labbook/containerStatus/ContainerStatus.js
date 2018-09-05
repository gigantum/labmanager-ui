//vendor
import React, { Component } from 'react'
import classNames from 'classnames'
import { connect } from 'react-redux'
//mutations
import StopContainerMutation from 'Mutations/StopContainerMutation'
import StartContainerMutation from 'Mutations/StartContainerMutation'
import StartDevToolMutation from 'Mutations/container/StartDevToolMutation'
import BuildImageMutation from 'Mutations/BuildImageMutation'
//store
import store from 'JS/redux/store'
import { setContainerState} from 'JS/redux/reducers/labbook/overview/overview'
import { setContainerStatus , setContainerMenuVisibility } from 'JS/redux/reducers/labbook/containerStatus'
import { setContainerMenuWarningMessage, setCloseEnvironmentMenus} from 'JS/redux/reducers/labbook/environment/environment'
import { setBuildingState, setMergeMode} from 'JS/redux/reducers/labbook/labbook'
import { setErrorMessage, setInfoMessage } from 'JS/redux/reducers/footer'

//
import FetchContainerStatus from './fetchContainerStatus'
//components
import ToolTip from 'Components/shared/ToolTip'

class ContainerStatus extends Component {
  constructor(props){
  	super(props);
    const {owner, labbookName} = store.getState().routes

    let state = {
      'status': "",
      'secondsElapsed': 0,
      'pluginsMenu': false,
      'containerStatus': this.props.containerStatus,
      'imageStatus': this.props.imageStatus,
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
    //memory clean up
    window.removeEventListener("click", this._closePopupMenus)
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

    let status = this._getContainerStatusText({
      containerStatus:this.props.containerStatus,
      imageStatus: this.props.imageStatus
    })

    const hasLabbookId = store.getState().overview.containerStates[this.props.labbookId]

    if(hasLabbookId){

      const storeStatus = store.getState().overview.containerStates[this.props.labbookId]

      if(storeStatus !== status){
        this.props.setContainerState(this.props.labbookId, status)
      }
    }

    window.addEventListener("click", this._closePopupMenus)
  }

  /**
  *  @param {}
  *  fetches status of labbook container and image
  *  sets state of labbook using redux and containerStatus using setState
  *  @return {}
  */
  _fetchStatus() {
    const { owner, labbookName } = store.getState().routes
    const state = this.state
    const self = this

    const {isBuilding} = this.props


    if(owner === this.state.owner && labbookName === this.state.labbookName && store.getState().routes.callbackRoute.split('/').length > 3) {

      FetchContainerStatus.getContainerStatus(owner, labbookName).then((response, error) => {

        if(response && response.labbook){

          const { environment } = response.labbook
          //reset build flags
          if((environment.imageStatus !== 'BUILD_IN_PROGRESS') && isBuilding){

            self.setState({
              isBuilding: false
            })
            this.props.setBuildingState(false)
          }
          //throws build failed error
          // passes error message to footer using redux
          if (state.imageStatus !== environment.imageStatus && environment.imageStatus === 'BUILD_FAILED') {
            this.props.setErrorMessage('Project failed to build: Check for and remove invalid dependencies and try again.')
          }
          //only updates state if container or imageStatus has changed
          if ((state.containerStatus !== environment.containerStatus) || (state.imageStatus !== environment.imageStatus)) {
            self.setState({
              'imageStatus': environment.imageStatus,
              'containerStatus': environment.containerStatus
            })
          }

        }
        //refetches status after a 3 second timeout
        setTimeout(() => {

          self._fetchStatus()
        }, 3 * 1000)

      })
    }
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
      (evt.target.className.indexOf('BranchMenu') > -1) ||
      (evt.target.className.indexOf('BranchMenu__sync-button') > -1) ||
      (evt.target.className.indexOf('BranchMenu__remote-button') > -1) ||
      (evt.target.className.indexOf('Activity__rollback-text') > -1) ||
      (evt.target.className.indexOf('CustomDockerfile__content-edit-button') > -1) ||
      (evt.target.className.indexOf('CustomDockerfile__content-save-button') > -1) ||
      (evt.target.className.indexOf('Labbook__name') > -1) ||
      (evt.target.className.indexOf('Labbook__branch-toggle') > -1) ||
      (evt.target.className.indexOf('Acitivty__rollback-button') > -1) ||
      (evt.target.className.indexOf('Activity__add-branch-button') > -1) ||
      (evt.target.className.indexOf('PackageDependencies__remove-button--full') > -1) ||
      (evt.target.className.indexOf('PackageDependencies__remove-button--half') > -1) ||
      (evt.target.className.indexOf('PackageDependencies__update-button') > -1) ||
      (evt.target.className.indexOf('BranchCard__delete-labbook') > -1)

    if(!containerMenuClicked &&
    this.props.containerMenuOpen){
      this.props.setContainerMenuVisibility(false)
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
  UNSAFE_componentWillReceiveProps(nextProps) {

    let status = this._getContainerStatusText(nextProps.containerStatus, nextProps.imageStatus)
    const hasLabbookId = store.getState().overview.containerStates[this.props.labbookId]

    if(hasLabbookId){
      const storeStatus = store.getState().overview.containerStates[this.props.labbookId]

      if(storeStatus !== status){
        this.props.setContainerState(this.props.labbookId, this._getContainerStatusText({containerStatus:nextProps.containerStatus, image:nextProps.imageStatus}))
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

    const labbookCreationDate = Date.parse(this.props.creationDateUtc + 'Z')
    const timeNow = Date.parse(new Date())

    let timeDifferenceMS =  timeNow - labbookCreationDate

    let status = (containerStatus === 'RUNNING') ? 'Running' : containerStatus;
    status = (containerStatus === 'NOT_RUNNING') ? 'Stopped' : status;
    status = (imageStatus === "BUILD_IN_PROGRESS") ? 'Building' : status;
    status = (imageStatus === "BUILD_FAILED") ? 'Rebuild' : status;
    status = (imageStatus === "DOES_NOT_EXIST") ? 'Rebuild' : status;
    status = ((imageStatus === "DOES_NOT_EXIST") || (imageStatus === "BUILD_IN_PROGRESS")) && (timeDifferenceMS < 15000) ? "Building" : status;

    status = ((status === 'Stopped') && (this.state.status === "Starting")) ? "Starting" : status;
    status = ((status === 'Running') && (this.state.status === "Stopping")) ? "Stopping" : status;

    if(store.getState().containerStatus.status !== status){
      this.props.setContainerStatus(status)
    }

    if((status) && (status !== 'Stopped') && (status !== 'Rebuild')){
      this.props.setCloseEnvironmentMenus()
    }

    return status;
  }
  /**
    @param {}
    triggers stop container mutation
  */
  _stopContainerMutation(){

    this.props.setContainerMenuVisibility(false)
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
          this.props.setErrorMessage(`There was a problem stopping ${self.state.labbookName} container`, error)

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
    this.props.setCloseEnvironmentMenus()
    this.props.setContainerMenuVisibility(false)

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
          this.props.setErrorMessage(`There was a problem starting ${this.state.labbookName} container`, error)
          if(error[0].message.indexOf('404 Client Error') > -1){
            self._rebuildContainer()
          }

        }else{

          this.props.setCloseEnvironmentMenus()
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
    this.props.setInfoMessage(`Starting ${developmentTool}, make sure to allow popups.`)

    StartDevToolMutation(
      owner,
      labbookName,
      developmentTool,
      (response, error)=>{

          if(response.startDevTool){
            let path = `${window.location.protocol}//${window.location.hostname}${response.startDevTool.path}`
            window.open(path, '_blank')
          }

          if(error){
            this.props.setErrorMessage("Error Starting Dev tool", error)
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

    if(!store.getState().labbook.isBuilding && !this.props.isLookingUpPackages){
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
        this.props.setMergeMode(false, false)
        this._startContainerMutation()

      }else if((status === "Rebuild") || (status === "Rebuild")){

        this.setState({
          status: "Building",
          contanerMenuRunning: false
        });

        this._rebuildContainer(evt, status)
      }
    }else{
      this.props.setContainerMenuWarningMessage(`Can't start container when environment is being edited`)
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
    newStatus = this.state.isMouseOver && (status === 'Stopped' && !this.props.isLookingUpPackages) ? 'Run' : newStatus
    newStatus = this.state.isMouseOver && (status === 'Rebuild') ? 'Rebuild' : newStatus
    newStatus = this.state.isMouseOver && (status === 'Rebuild') ? 'Rebuild' : newStatus

    newStatus = this.props.isBuilding? 'Building' : this.state.isSyncing ? 'Syncing' : this.state.isPublishing ? 'Publishing' : newStatus

    return newStatus;
  }
  /**
    @param {}
    triggers build image mutations with force === true
    @return {}
  */
  _rebuildContainer(){
    this.props.setContainerMenuVisibility(false)

    let {labbookName, owner} = this.state
    let self = this

    this.setState({imageStatus: "BUILD_IN_PROGRESS"});


    BuildImageMutation(
      labbookName,
      owner,
      true,
      (response, error)=>{
          if(error){
            console.log(error)
          }

          self.setState({rebuildAttempts: this.state.rebuildAttempts + 1})

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
    let excludeStatuses = ['Stopping', 'Starting', 'Building', 'Publishing', 'Syncing']

    let notExcluded = excludeStatuses.indexOf(this.state.status) === -1

    const containerStatusCss = classNames({
      'ContainerStatus__container-state--menu-open': this.props.containerMenuOpen,
      'ContainerStatus__container-state': !this.props.containerMenuOpen,
      [status]: !this.props.isBuilding && !this.props.isSyncing && !this.props.isPublishing,
      'Building': this.props.isBuilding || this.state.imageStatus === 'BUILD_IN_PROGRESS',
      'Syncing': this.props.isSyncing,
      'Publishing': this.props.isPublishing,
      'LookingUp': this.props.isLookingUpPackages,
      'ContainerStatus__container-state--expanded': this.state.isMouseOver && notExcluded && !this.props.isBuilding && !(this.state.imageStatus === 'BUILD_IN_PROGRESS') ,
      'ContainerStatus__container-remove-pointer': !notExcluded || this.props.isBuilding || (this.state.imageStatus === 'BUILD_IN_PROGRESS') || this.state.isSyncing ||this.state.isPublishing
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
                              onClick={() => this._openDevToolMuation(developmentTool)}
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
          onMouseOver={() => {this._setMouseOverState(true)}}
          onMouseOut ={() => {this._setMouseOverState(false)}}>

          {this._getStatusText(textStatus)}

        </div>

        {
          this.props.containerMenuOpen &&

          <div className="ContainerStatus__menu-pointer"></div>

        }

        {
          this.props.containerMenuOpen &&

          <div className="ContainerStatus__button-menu">

            {
              store.getState().environment.containerMenuWarning
            }

          </div>

        }
      <ToolTip
        section="containerStatus"
      />
      </div>)
  }

  _errorMessage(error){
      return(<div>{error.message}</div>)
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    containerMenuOpen: state.containerStatus.containerMenuOpen,
    isLookingUpPackages: state.containerStatus.isLookingUpPackages
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setContainerState,
    setContainerStatus,
    setContainerMenuVisibility,
    setBuildingState,
    setErrorMessage,
    setCloseEnvironmentMenus,
    setInfoMessage,
    setMergeMode,
    setContainerMenuWarningMessage,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ContainerStatus);

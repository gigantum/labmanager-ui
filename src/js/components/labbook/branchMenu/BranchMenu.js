//vendor
import React, { Component, Fragment } from 'react'
import classNames from 'classnames'
import uuidv4 from 'uuid/v4'
//utilities
import JobStatus from 'JS/utils/JobStatus'
//mutations
import ExportLabbookMutation from 'Mutations/ExportLabbookMutation'
import PublishLabbookMutation from 'Mutations/branches/PublishLabbookMutation'
import PushActiveBranchToRemoteMutation from 'Mutations/branches/PushActiveBranchToRemoteMutation'
import SyncLabbookMutation from 'Mutations/branches/SyncLabbookMutation'
import BuildImageMutation from 'Mutations/BuildImageMutation'
//queries
import UserIdentity from 'JS/Auth/UserIdentity'
//store
import store from 'JS/redux/store'
//components
import DeleteLabbook from './DeleteLabbook'
import ForceSync from './ForceSync'
import LoginPrompt from './LoginPrompt'
import CreateBranch from 'Components/labbook/branches/CreateBranch'
import Collaborators from './collaborators/Collaborators'
import ToolTip from 'Components/shared/ToolTip';

export default class BranchMenu extends Component {
  constructor(props) {
    super(props);
    const { owner, labbookName } = store.getState().routes
    this.state = {
      'addNoteEnabled': false,
      'isValid': true,
      'createBranchVisible': false,
      'addedRemoteThisSession': !(this.props.defaultRemote === null),
      'showCollaborators': false,
      'newCollaborator': '',
      'showLoginPrompt': false,
      'exporting': false,
      'deleteModalVisible': false,
      'forceSyncModalVisible': false,
      'remoteUrl': this.props.remoteUrl,
      'publishDisabled': false,
      'addCollaboratorButtonDisabled': false,
      'collaboratorBeingRemoved': null,
      'collabKey': uuidv4(),
      'justOpened': true,
      'syncWarningVisible': false,
      owner,
      labbookName
    }
    this._openMenu = this._openMenu.bind(this)
    this._closeMenu = this._closeMenu.bind(this)
    this._toggleModal = this._toggleModal.bind(this)
    this._mergeFilter = this._mergeFilter.bind(this)
    this._sync = this._sync.bind(this)
    this._closeLoginPromptModal = this._closeLoginPromptModal.bind(this)
    this._exportLabbook = this._exportLabbook.bind(this)
    this._toggleSyncModal = this._toggleSyncModal.bind(this)
    this._switchBranch = this._switchBranch.bind(this)
    this._remountCollab = this._remountCollab.bind(this)
    this._handleToggleModal = this._handleToggleModal.bind(this)

  }


  /**
   * attach window listener evetns here
  */
  componentDidMount() {
    window.addEventListener('click', this._closeMenu)
    let username = localStorage.getItem('username')
    if ((this.props.owner === username) && this.props.defaultRemote && !this.state.canManageCollaborators) {
      store.dispatch({
        type: 'INFO_MESSAGE',
        payload: {
          message: `${username} needs to log out and then log back in to validate for remote operations`
        }
      })
    }

  }
  /**
   * detach window listener evetns here
  */
  componentWillUnmount() {

    window.removeEventListener('click', this._closeMenu)
  }

  /**
    @param {event} evt
    closes menu
  */
  _closeMenu(evt) {
    let isBranchMenu = (evt.target.className.indexOf('BranchMenu') > -1) || (evt.target.className.indexOf('CollaboratorModal') > -1) || (evt.target.className.indexOf('BranchMenu__button-menu') > -1)


    if (!isBranchMenu && this.state.menuOpen) {
      this.setState({ menuOpen: false, justOpened: true })
      this.refs['collaborators'].setState({collaboratorModalVisible: false})
    }

    if(evt.target.className.indexOf('BranchMenu__sync-button') === -1){
      this.setState({syncWarningVisible: false})
    }

  }

  /**
    @param {string} value
    sets state on createBranchVisible and toggles modal cover
  */
  _toggleModal(value) {

    this.setState({
      [value]: !this.state[value]
    })

  }
  /**
  *  @param {}
  *  toggles open menu state
  *  @return {string}
  */
  _openMenu() {

    this.setState({ menuOpen: !this.state.menuOpen})

    if(!this.state.menuOpen){
      setTimeout(() => {

        this.setState({ justOpened: false })
      }, 500)
    }else{
      this.setState({ justOpened: true })
    }

  }
  /**
  *  @param {}
  *  remounts collaborators by updating key
  *  @return {}
  */
  _remountCollab() {
    this.setState({collabKey: uuidv4()});

  }
  /**
  *  @param {string, boolean} action, containerRunning
  *  displays container menu message
  *  @return {}
  */
  _showContainerMenuMessage(action, containerRunning) {

    let dispatchMessage = containerRunning ? `Stop Project before ${action}. \n Be sure to save your changes.` : `Project is ${action}. \n Please do not refresh the page.`

    store.dispatch({
      type: 'CONTAINER_MENU_WARNING',
      payload: {
        message: dispatchMessage
      }
    })
    this.setState({menuOpen: false});
    store.dispatch({
      type: 'UPDATE_CONTAINER_MENU_VISIBILITY',
      payload: {
        containerMenuOpen: true
      }
    })
  }

  /**
  *  @param {}
  *  adds remote url to labbook
  *  @return {string}
  */
  _publishLabbook() {
    if (!this.props.isMainWorkspace) {
      store.dispatch({
        type: 'WARNING_MESSAGE',
        payload: {
          message: 'Publishing is currently only available on the main workspace branch.',
        }
      })
    } else {
      let id = uuidv4()
      let self = this;

      this._checkSessionIsValid().then((response) => {
        if (response.data) {

          if (response.data.userIdentity.isSessionValid) {
            if(store.getState().containerStatus.status !== 'Running'){
              self.setState({ menuOpen: false, 'publishDisabled': true})

              store.dispatch({
                type: 'MULTIPART_INFO_MESSAGE',
                payload: {
                  id: id,
                  message: 'Publishing Project to Gigantum cloud ...',
                  isLast: false,
                  error: false
                }
              })

              if (!self.state.remoteUrl) {
                this.props.setPublishingState(true)

                this._showContainerMenuMessage('publishing');

                PublishLabbookMutation(
                  self.state.owner,
                  self.state.labbookName,
                  self.props.labbookId,
                  (response, error) => {
                    this.props.setPublishingState(false)
                    store.dispatch({
                      type: 'UPDATE_CONTAINER_MENU_VISIBILITY',
                      payload: {
                        containerMenuOpen: false
                      }
                    })
                    if(error){
                      console.log(error)

                      store.dispatch({
                        type: 'ERROR_MESSAGE',
                        payload: {
                          id: id,
                          message: 'Publish failed',
                          messageBody: error,
                        }
                      })
                    }
                    self.setState({
                      publishDisabled: false
                    })
                    if (response.publishLabbook && response.publishLabbook.success) {
                      this._remountCollab();
                      store.dispatch({
                        type: 'MULTIPART_INFO_MESSAGE',
                        payload: {
                          id: id,
                          message: `Added remote https://gigantum.com/${self.state.owner}/${self.state.labbookName}`,
                          isLast: true,
                          error: false
                        }
                      })

                      self.setState({
                        addedRemoteThisSession: true,
                        remoteUrl: `https://gigantum.com/${self.state.owner}/${self.state.labbookName}`

                      })
                    }
                  }
                )
              }
            } else {
              this._showContainerMenuMessage('publishing', true)
            }
          } else {
            self.setState({
              'remoteUrl': ''
            })
            self.setState({
              showLoginPrompt: true
            })
          }
        }
      })
    }
  }
  /**
  *  @param {}
  *  toggles sync modal
  *  @return {string}
  */
  _toggleSyncModal(){
    this.setState({'forceSyncModalVisible': !this.state.forceSyncModalVisible})
  }
  /**
  *  @param {}
  *  pushes code to remote
  *  @return {string}
  */
  _sync() {
    if (!this.props.isMainWorkspace) {
      store.dispatch({
        type: 'WARNING_MESSAGE',
        payload: {
          message: 'Syncing is currently only available on the main workspace branch.',
        }
      })
    } else {
      const status = store.getState().containerStatus.status

      if(this.state.owner !== 'gigantum-examples'){
        this.setState({ menuOpen: false });
      }

      if((status === 'Stopped') || (status === 'Rebuild')){

        let id = uuidv4()
        let self = this;

        this._checkSessionIsValid().then((response) => {

          if (response.data) {

            if (response.data.userIdentity.isSessionValid) {

              if(this.state.owner === 'gigantum-examples'){

                this.setState({syncWarningVisible: true})

              } else {

                store.dispatch({
                  type: 'MULTIPART_INFO_MESSAGE',
                  payload: {
                    id: id,
                    message: 'Syncing Project with Gigantum cloud ...',
                    isLast: false,
                    error: false
                  }
                })

                this.props.setSyncingState(true);
                this._showContainerMenuMessage('syncing');

                SyncLabbookMutation(
                  this.state.owner,
                  this.state.labbookName,
                  false,
                  (error) => {
                    this.props.setSyncingState(false);
                    if (error) {
                      store.dispatch({
                        type: 'MULTIPART_INFO_MESSAGE',
                        payload: {
                          id: id,
                          message: `Could not sync ${this.state.labbookName}`,
                          messageBody: error,
                          isLast: true,
                          error: true
                        }
                      })

                      if((error[0].message.indexOf('MergeError') > -1 ) || (error[0].message.indexOf('Cannot merge') > -1) || (error[0].message.indexOf('Merge conflict') > -1)){

                        self._toggleSyncModal()
                      }
                    } else {
                      BuildImageMutation(
                        this.state.labbookName,
                        this.state.owner,
                        false,
                        (response, error) => {
                          if (error) {
                            console.error(error)
                            store.dispatch(
                              {
                                type: 'MULTIPART_INFO_MESSAGE',
                                payload: {
                                  id: id,
                                  message: `ERROR: Failed to build ${this.state.labookName}`,
                                  messsagesList: error,
                                  error: true
                                }
                              })
                          }
                        })
                      store.dispatch({
                        type: 'UPDATE_CONTAINER_MENU_VISIBILITY',
                        payload: {
                          containerMenuOpen: false
                        }
                      })
                      store.dispatch({
                        type: 'MULTIPART_INFO_MESSAGE',
                        payload: {
                          id: id,
                          message: `Successfully synced ${this.state.labbookName}`,
                          isLast: true,
                          error: false
                        }
                      })
                    }
                  }
                )

              }

            } else {

              self.setState({
                showLoginPrompt: true
              })
            }
          }
        })
      } else {
        this.setState({ menuOpen: false });
        store.dispatch({
          type: 'CONTAINER_MENU_WARNING',
          payload: {
            message: 'Stop Project before syncing. \n Be sure to save your changes.'
          }
        });
        store.dispatch({
          type: 'UPDATE_CONTAINER_MENU_VISIBILITY',
          payload: {
            containerMenuOpen: true
          }
        })
      }
    }
  }

  /**
  *  @param {}
  *  pushes code to remote
  *  @return {string}
  */
  _pullFromRemote() {
    let self = this;
    this._checkSessionIsValid().then((response) => {
      if (response.data) {

        if (response.data.userIdentity.isSessionValid) {
          PushActiveBranchToRemoteMutation(
            this.state.owner,
            this.state.labbookName,
            'origin',
            this.props.labbookId,
            (error) => {
              if (error) {
                console.log(error)
              }
            }
          )
        } else {

          //auth.login()
          self.setState({
            showLoginPrompt: true
          })
        }
      }
    })
  }
  /**
  *  @param {}
  *  shows collaborators warning if user is not owner
  *  @return {}
  */
  _showCollaboratorsWarning(){
    const {owner} = store.getState().routes
    const username = localStorage.getItem('username')

    if(owner !== username){
      store.dispatch({
        type: 'WARNING_MESSAGE',
        payload: {
          message: `Only ${owner} can add and remove collaborators in this labbook.`,
        }
      })
    }
  }
  /**
  *  @param {}
  *  sets state of Collaborators
  *  @return {}
  */
  _toggleCollaborators() {
    let self = this;

    this._checkSessionIsValid().then((response) => {

      if (response.data) {

        if (response.data.userIdentity.isSessionValid) {
          if (this.state.canManageCollaborators) {
            let self = this;
            this.setState({ menuOpen: false });
            this._checkSessionIsValid().then((response) => {
              if (response.data) {

                if (response.data.userIdentity.isSessionValid) {

                  this.setState({
                    showCollaborators: !this.state.showCollaborators,
                    newCollaborator: ''
                  })
                  this.refs['collaborators'].inputTitle.value = ''
                } else {

                  //auth.login()
                  self.setState({
                    showLoginPrompt: true
                  })
                }
              }
            })
          } else {
            this._showCollaboratorsWarning()
          }
        } else {

          self.setState({
            showLoginPrompt: true
          })
        }
      }
    })

  }

  /**
  *  @param {}
  *  returns UserIdentityQeury promise
  *  @return {promise}
  */
  _checkSessionIsValid() {
    return (UserIdentity.getUserIdentity())
  }
  /**
  *  @param {}
  *  closes login prompt modal
  *  @return {}
  */
  _closeLoginPromptModal() {
    this.setState({
      'showLoginPrompt': false
    })
  }
  /**
  *  @param {}
  *  copies remote
  *  @return {}
  */
  _copyRemote(){

    let copyText = document.getElementById('BranchMenu-copy')
    copyText.select();
    document.execCommand("Copy");

    store.dispatch({
      type: 'INFO_MESSAGE',
      payload: {
        'message':`${copyText.value} copied!`
      }
    })
  }

  /**
  *  @param {jobKey}
  *  polls jobStatus for export job message
  *  updates footer with a message
  *  @return {}
  */
  _jobStatus(jobKey){

    let self = this;

    JobStatus.getJobStatus(jobKey).then((data) => {
      if(data.jobStatus.status !== 'queued'){
        this.props.setExportingState(false);

        if (data.jobStatus.result) {
          store.dispatch({
            type: 'INFO_MESSAGE',
            payload: {
              message: `Export file ${data.jobStatus.result} is available in the export directory of your Gigantum working directory.`,
            }
          })
        }

        this.setState({ exporting: false });
      }else{
        setTimeout(()=>{
          store.dispatch({
            type: 'INFO_MESSAGE',
            payload: {
              message: `Exporting...`,
            }
          })
          self._jobStatus(jobKey)
        },500)

      }
    }).catch((error) => {

      this.props.setExportingState(false);

      console.log(error)

      let errorArray = [{'message': 'Export failed.'}]
      store.dispatch({
        type: 'ERROR_MESSAGE',
        payload: {
          message: `${this.state.labbookName} failed to export `,
          messageBody: errorArray
        }
      })
      this.setState({ exporting: false });
    })
  }

  /**
  *  @param {}
  *  runs export mutation if export has not been downloaded
  *  @return {}
  */
  _exportLabbook = (evt) => {
    if(store.getState().containerStatus.status !== 'Running'){
      this.setState({ exporting: true, menuOpen: false });
      store.dispatch({
        type: 'INFO_MESSAGE',
        payload: {
          message: `Exporting ${this.state.labbookName} Project`,
        }
      })
      this.props.setExportingState(true);
      ExportLabbookMutation(this.state.owner, this.state.labbookName, (response, error) => {
        if (response.exportLabbook) {

          this._jobStatus(response.exportLabbook.jobKey)
        } else {
          console.log(error)
          this.props.setExportingState(false);
          store.dispatch({
            type: 'ERROR_MESSAGE',
            payload: {
              message: 'Export Failed',
              messageBody: error
            }
          })
        }
      })
    } else {
      this._showContainerMenuMessage('exporting', true)
    }
  }
  /**
  *  @param {}
  *  toggle stat and modal visibility
  *  @return {}
  */
  _toggleDeleteModal(){
    this.setState({deleteModalVisible: !this.state.deleteModalVisible})
  }
  /**
  *  @param {}
  *  sets menu
  *  @return {}
  */
  _mergeFilter(){
    if(store.getState().containerStatus.status !== 'Running'){
      this.props.toggleBranchesView(true, true)
      this.setState({ menuOpen: false })
      window.scrollTo(0, 0);
    } else {
     this._showContainerMenuMessage('merging branches', true)
    }
  }
  /**
  *  @param {}
  *  sets menu
  *  @return {}
  */
  _switchBranch(){
    let status = store.getState().containerStatus.status
    if(status !== 'Running' ){
      window.scrollTo(0, 0);
      this.props.toggleBranchesView(true, false)
      this.setState({ menuOpen: false })
    } else {
      this._showContainerMenuMessage('switching branches', true)
     }
  }

  /**
  *  @param {string} modal
  *  passes modal to toggleModal if container is not running
  *  @return {}
  */
  _handleToggleModal(modal) {
    let action = '';
    if(store.getState().containerStatus.status !== 'Running'){
      this._toggleModal(modal)
    } else {
      switch(modal){
        case 'createBranchVisible':
          action = 'creating branches'
          break;
        default :
          break;
      }
      this._showContainerMenuMessage(action, true)
    }
  }

  render() {
    const {labbookName, owner} = this.state

    const branchMenuCSS = classNames({
      'BranchMenu__menu--animation': this.state.justOpened, //this is needed to stop animation from breaking position flow when collaborators modal is open
      'hidden': !this.state.menuOpen,
      'BranchMenu__menu': true
    })
    const exportCSS = classNames({
      'BranchMenu__item--export': !this.state.exporting,
      'BranchMenu__item--export--downloading': this.state.exporting
    })

    return (
      <div className="BranchMenu flex flex--column'">
        {
          this.state.showLoginPrompt &&
          <LoginPrompt closeModal={this._closeLoginPromptModal} />
        }
        {
          this.state.deleteModalVisible &&
          <DeleteLabbook
            handleClose={()=> this._toggleDeleteModal()}
            remoteAdded={this.state.addedRemoteThisSession}
            history={this.props.history}
          />
        }
        {
          this.state.forceSyncModalVisible &&
          <ForceSync toggleSyncModal={this._toggleSyncModal}/>

        }

        <CreateBranch
          description={this.props.description}
          modalVisible={this.state.createBranchVisible}
          toggleModal={this._toggleModal}
        />

        <button onClick={()=>{this._openMenu()}} className="BranchMenu__button">Actions</button>
        <div className={this.state.menuOpen ? 'BranchMenu__menu-arrow' :  'BranchMenu__menu-arrow hidden'}></div>
        <div className={branchMenuCSS}>

          <ul className="BranchMenu__list">
            <Collaborators
              key={this.state.collabKey}
              ref="collaborators"
              owner={owner}
              labbookName={labbookName}
              checkSessionIsValid={this._checkSessionIsValid}
              showLoginPrompt={()=>this.setState({showLoginPrompt: true})}
            />
            <hr />
            <li className="BranchMenu__item--new-branch">
              <button
                onClick={() => {this._handleToggleModal('createBranchVisible')}}
                className="BranchMenu__item--flat-button"
              >
                New Branch
              </button>

            </li>
            <li className="BranchMenu__item--switch">
              <button
                onClick={() => { this._switchBranch()}}
                className="BranchMenu__item--flat-button"
              >
                Switch Branch
              </button></li>
            <li className="BranchMenu__item--merge">
              <button
                onClick={() => { this._mergeFilter()}}
                className="BranchMenu__item--flat-button"
              >
                Merge Branch
              </button></li>

            <li className={exportCSS}>
              <button
                onClick={(evt) => this._exportLabbook(evt)}
                disabled={this.state.exporting}
                className="BranchMenu__item--flat-button"
              >
                Export
              </button>
            </li>

            <li className="BranchMenu__item--delete">
              <button
                onClick={() => this._toggleDeleteModal()}
                className="BranchMenu__item--flat-button"
              >
                Delete Labbook
              </button>
            </li>
          </ul>
          <hr className="BranchMenu__line" />
          {!this.state.addedRemoteThisSession &&
            <div className="BranchMenu__publish">
              <button
                className="BranchMenu__remote-button"
                onClick={() => { this._publishLabbook() }}
              >
                Publish
                </button>
            </div>
          }

          {this.state.addedRemoteThisSession &&
            <div className="BranchMenu__sync">
              <button
                className="BranchMenu__sync-button"
                onClick={() => this._sync()}
              >
                Sync Branch
                </button>
              {
                this.state.syncWarningVisible &&
                <Fragment>

                  <div className="BranchMenu__menu-pointer">
                  </div>

                  <div className="BranchMenu__button-menu">
                    Synching is disabled for example projects.
                  </div>

                </Fragment>
              }

              </div>
            }

            {
              this.state.remoteUrl &&
              <div>
                <hr className="BranchMenu__line"/>
                <div className="BranchMenu__copy-remote">
                  <input
                    id="BranchMenu-copy"
                    className="BranchMenu__input"
                    defaultValue={`gigantum.com/${this.state.owner}/${this.state.labbookName}`}
                    type="text" />
                  <button onClick={()=> this._copyRemote()} className="BranchMenu__copy-button fa fa-clone"></button>
                </div>
              </div>
            }
          </div>
          <ToolTip section="actionMenu"/>
        </div>
    )
  }
}

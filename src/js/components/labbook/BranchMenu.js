//vendor
import React, { Component } from 'react'
import { WithContext as ReactTags } from 'react-tag-input';
//utilities
import validation from 'JS/utils/Validation'
//mutations
import CreateBranchMutation from 'Mutations/branches/CreateBranchMutation'
import PublishLabbookMutation from 'Mutations/branches/PublishLabbookMutation'
import PushActiveBranchToRemoteMutation from 'Mutations/branches/PushActiveBranchToRemoteMutation'
import SyncLabbookMutation from 'Mutations/branches/SyncLabbookMutation'
import AddCollaboratorMutation from 'Mutations/AddCollaboratorMutation'
import DeleteCollaboratorMutation from 'Mutations/DeleteCollaboratorMutation'
//store
import store from 'JS/redux/store'


export default class UserNote extends Component {
  constructor(props){
  	super(props);
    const {owner, labbookName} = store.getState().routes
    this.state = {
      'addNoteEnabled': false,
      'remoteURL': '',
      'newBranchName': '',
      'isValid': true,
      'createBranchVisible': false,
      'addRemoteVisible': false,
      'addedRemoteThisSession': !(this.props.defaultRemote === null),
      'showCollaborators': false,
      'newCollaborator': '',
      'canManageCollaborators': this.props.canManageCollaborators,
      owner,
      labbookName
    }

    this._openMenu = this._openMenu.bind(this)
    this._closeMenu = this._closeMenu.bind(this)
    this._toggleModal = this._toggleModal.bind(this)
    this._createNewBranch = this._createNewBranch.bind(this)
    this._sync = this._sync.bind(this)
  }

  /**
   * attach window listener evetns here
  */
  componentDidMount(){
    window.addEventListener('click', this._closeMenu)
    let username = localStorage.getItem('username')
    if((this.props.owner === username) && this.props.defaultRemote && !this.props.canManageCollaborators){
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
  _closeMenu(evt){
    let isBranchMenu = evt.target.className.indexOf('BranchMenu') > -1

    if(!isBranchMenu && this.state.menuOpen ){
      this.setState({menuOpen: false})
    }
  }
  /**
    @param {string} branchName
    creates a new branch
  */
  _createNewBranch(branchName){
    let self = this;
    this.setState({
      branchesOpen: true,
      newBranchName: '',
      isValid: true,
    })


    CreateBranchMutation(
      this.state.owner,
      this.state.labbookName,
      branchName,
      this.props.labbookId,
      (error, response)=>{
        self._toggleModal('createBranchVisible')
        if(error){
          store.dispatch({
            type: 'ERROR_MESSAGE',
            payload: {
              message: "Problem Creating new branch, make sure you have a valid session and internet connection",
              messagesList: error
            }
          })


        }
      })

  }
  /**
    @param {string} value
    sets state on createBranchVisible and toggles modal cover
  */
  _toggleModal(value){
    this.setState({menuOpen: false})
    if(!this.state[value]){
      document.getElementById('modal__cover').classList.remove('hidden')
    }else{
      document.getElementById('modal__cover').classList.add('hidden')
    }
    this.setState({
      [value]: !this.state[value]
    })
  }
  /**
    @param {object} event
    validates new branch name and sets state if it passes validation
  */
  _setNewBranchName(evt){

      let isValid = validation.labbookName(evt.target.value);

      if(isValid){
        this.setState({
          newBranchName: evt.target.value,
          isValid: true
        })
      }else{
        this.setState({
          isValid: false
        })
      }
  }

  /**
  *  @param {}
  *  toggles open menu state
  *  @return {string}
  */
  _openMenu(){
    this.setState({menuOpen: !this.state.menuOpen})
  }

  /**
  *  @param {event} evt
  *  toggles open menu state
  *  @return {string}
  */
  _updateRemote(evt){
    this.setState({
      remoteURL: evt.target.value
    })
  }

  /**
  *  @param {}
  *  adds remote url to labbook
  *  @return {string}
  */
  _addRemote(){

    this.setState({menuOpen: false})

    store.dispatch({
      type: 'INFO_MESSAGE',
      payload: {
        message: 'Adding remote server ..'
      }
    })

    if(this.state.remoteURL.length > -1){
      PublishLabbookMutation(
        this.state.owner,
        this.state.labbookName,
        this.props.labbookId,
        (error)=>{
          if(error){

            store.dispatch({
              type: 'INFO_MESSAGE',
              payload: {
                message: 'Publish failed'
              }
            })
          }else{

            store.dispatch({
              type: 'INFOR_MESSAGE',
              payload: {
                message: `Added remote https://repo.gigantum.io/${this.state.owner}/${this.state.labbookName}`
              }
            })
            this.setState({
              addedRemoteThisSession: true,
              canManageCollaborators: true
            })
          }
        }
      )
    }

    this.setState({
      'remoteURL': ''
    })
  }

  /**
  *  @param {}
  *  pushes code to remote
  *  @return {string}
  */
  _sync(){

    store.dispatch({
      type: 'INFO_MESSAGE',
      payload: {
        message: 'Syncing with remote ...'
      }
    })
    SyncLabbookMutation(
      this.state.owner,
      this.state.labbookName,
      (error)=>{
        if(error){
          store.dispatch({
            type: 'ERROR_MESSAGE',
            payload: {
              message: `Could not sync ${this.state.labbookName}`,
              messagesList: error
            }
          })
        }else{
          store.dispatch({
            type: 'INFO_MESSAGE',
            payload: {
              message: `Successfully synced ${this.state.labbookName}`
            }
          })
        }
      }
    )

  }

  /**
  *  @param {}
  *  pushes code to remote
  *  @return {string}
  */
  _pullFromRemote(){
    PushActiveBranchToRemoteMutation(
      this.state.owner,
      this.state.labbookName,
      'origin',
      this.props.labbookId,
      (error)=>{
        if(error){
          console.log(error)
        }
      }
    )
  }
  /**
  *  @param {}
  *  sets state of Collaborators
  *  @return {}
  */
  _toggleCollaborators(){
    if(!this.state.showCollaborators){
      document.getElementById('modal__cover').classList.remove('hidden')
    }else{
      document.getElementById('modal__cover').classList.add('hidden')
    }
    this.setState({showCollaborators: !this.state.showCollaborators, newCollaborator: ''})
    this.inputTitle.value =''
  }
  /**
  *  @param {event} evt
  *  sets state of Collaborators
  *  @return {}
  */
  _addCollaborator(evt){


    if((evt.type === 'click') || (evt.key === "ENTER")){
      //waiting for backend updates
      AddCollaboratorMutation(
        this.state.labbookName,
        this.state.owner,
        this.state.newCollaborator,
        (error)=>{
          this.setState({newCollaborator: ''})
          if(error){
            console.log(error)
            store.dispatch({
              type: 'ERROR_MESSAGE',
              payload: {
                message: `Could not add collaborator`,
                messagesList: error
              }
            })
          }else{

          }
        }

      )
    }else{
      this.setState({newCollaborator: evt.target.value})
    }
  }
  /**
  *  @param {string} collaborator
  *  sets state of Collaborators
  *  @return {}
  */
  _removeCollaborator(collaborator){
    DeleteCollaboratorMutation(
      this.state.labbookName,
      this.state.owner,
      collaborator,
      (error)=>{
        if(error){
          store.dispatch({
            type: 'ERROR_MESSAGE',
            payload: {
              message: `Could not remove collaborator`,
              messagesList: error
            }
          })
        }
      }
    )
  }


  render(){
    const {tags} = this.state;

    return(
      <div className="BranchMenu flex flex--column">

        <div className={this.state.showCollaborators ? 'BranchModal--collaborators': 'hidden'}>
          <div
            onClick={()=>{this._toggleCollaborators()}}
            className="BranchModal--close"></div>
          <h4
            className="BranchModal__header">Collaborators</h4>
          <hr />
          <div className="BranchMenu__add">
            <input
              ref={el => this.inputTitle = el}
              onChange={(evt)=>this._addCollaborator(evt)}
              className="BranchMenu__add-collaborators"
              type="text"
              placeholder="Add Collaborators" />
            <button
              onClick={(evt)=>this._addCollaborator(evt)}
              className="BranchMenu__add-button">Add</button>
          </div>


            { this.props.collaborators &&
              <ul className="BranchMenu__collaborators-list">
                {
                  this.props.collaborators.map((collaborator) => {
                    return (<li className="BranchMenu__collaborator--item">
                      <div>{collaborator}</div>
                      <button disabled={collaborator === localStorage.getItem('username')} onClick={()=> this._removeCollaborator(collaborator)}>Remove</button>
                    </li>)
                  })
                }
              </ul>
            }

        </div>
          <div

            className={ this.state.createBranchVisible ? 'BranchModal' : 'hidden'}>
            <div
              onClick={()=>{this._toggleModal('createBranchVisible')}}
              className="BranchModal--close">
            </div>
            <h4 className="BranchModal__header--new-branch">New Branch</h4>
            <hr />
            <input
              className="BranchCard__name-input"
              onKeyUp={(evt)=>{ this._setNewBranchName(evt) }}
              type="text"
              placeholder="Branch name"
            />
            <p className={!this.state.isValid ? 'Branch__error error': 'Branch__error visibility-hidden'}> Error: Title may only contain alphanumeric characters separated by hyphens. (e.g. my-branch-name)</p>
            <button
              className="BranchCard__create-branch"
              disabled={(this.state.newBranchName.length === 0) && this.state.isValid}
              onClick={()=>{this._createNewBranch(this.state.newBranchName)}}>
              Create Branch
            </button>
          </div>

          <div
            className={ this.state.addRemoteVisible ? 'BranchModal' : 'hidden'}>
            <div className="BranchMenu__add-remote-container">
              <div
                onClick={()=>{this._toggleModal('addRemoteVisible')}}
                className="BranchModal--close">
              </div>
              <input
                type="text"
                placeholder="Paste remote address here"
                onKeyUp={(evt)=>{this._updateRemote(evt)}}
                onChange={(evt)=>{this._updateRemote(evt)}}
              />
              <button
                disabled={(this.state.remoteURL.length === 0)}
                onClick={() => this._addRemote()}

                >
                Add Remote
              </button>
            </div>
          </div>
          <button onClick={()=>{this._openMenu()}} className="BranchMenu__button"></button>
          <div className={this.state.menuOpen ? 'BranchMenu__menu-arrow' :  'BranchMenu__menu-arrow hidden'}></div>
          <div className={this.state.menuOpen ? 'BranchMenu__menu' : 'BranchMenu__menu hidden'}>

            <ul className="BranchMenu__list">
              <li className="BranchMenu__item--collaborators">
                <button
                  disabled={!this.state.canManageCollaborators}
                  onClick={()=> this._toggleCollaborators()}
                  className='BranchMenu__item--collaborators-button'>Collaborators</button>

              <hr />
              </li>
              <li className="BranchMenu__item--new-branch">
                New Branch
              </li>
              <li className="BranchMenu__item--merge">Merge</li>
              <li className="BranchMenu__item--deadend">Dead-end</li>
              <li className="BranchMenu__item--favorite">Favorite</li>
            </ul>
            <hr className="BranchMenu__line"/>
            {/* <button>Publish</button> */}
            {!this.state.addedRemoteThisSession &&
              <div className="BranchMenu__publish">
                <button
                  className="BranchMenu__remote-button"
                  onClick={()=>{this._addRemote()}}
                  >
                  Publish
                </button>
              </div>
            }

            { this.state.addedRemoteThisSession &&
              <div className="BranchMenu__sync">
                <button
                  className="BranchMenu__sync-button"
                  onClick={() => this._sync()}
                  >
                  Sync Branch
                </button>
              </div>
            }
          </div>
      </div>
    )
  }
}

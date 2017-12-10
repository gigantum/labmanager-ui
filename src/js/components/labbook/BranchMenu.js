import React, { Component } from 'react'
import SimpleMDE from 'simplemde'
import { WithContext as ReactTags } from 'react-tag-input';
//utilities
import validation from 'JS/utils/Validation'
//mutations
import CreateBranchMutation from 'Mutations/branches/CreateBranchMutation'
import AddLabbookRemoteMutation from 'Mutations/branches/AddLabbookRemoteMutation'
import PushActiveBranchToRemoteMutation from 'Mutations/branches/PushActiveBranchToRemoteMutation'
import PullActiveBranchFromRemoteMutation from 'Mutations/branches/PullActiveBranchFromRemoteMutation'
//store
import store from 'JS/redux/store'



let simple;

export default class UserNote extends Component {
  constructor(props){
  	super(props);
    this.state = {
      'addNoteEnabled': false,
      'remoteURL': '',
      'newBranchName': '',
      'isValid': true,
      'createBranchVisible': false,
      'addRemoteVisible': false,
      'addedRemoteThisSession': !(this.props.defaultRemote === null)
    }

    this._openMenu = this._openMenu.bind(this)
    this._toggleModal = this._toggleModal.bind(this)
    this._createNewBranch = this._createNewBranch.bind(this)
    this._sync = this._sync.bind(this)
  }
  /**
    @param {string} branchName
    creates a new branch
  */
  _createNewBranch(branchName){
    this.setState({
      branchesOpen: true,
      newBranchName: '',
      isValid: true
    })
    let username = localStorage.getItem('username')

    CreateBranchMutation(
      username,
      this.props.labbookName,
      branchName,
      this.props.labbookId,
      (error)=>{
        if(error){

        }
      })

  }
  /**
    @param {string} value
    sets state on createBranchVisible and toggles modal cover
  */
  _toggleModal(value){
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

    let remote = 'ssh://git@repo.gigantum.io:9922/root/' + this.props.labbookName + '.git'
    let self = this;

    store.dispatch({
      type: 'UPLOAD_MESSAGE',
      payload: {
        uploadMessage: 'Adding remote server ..',
        error: false,
        loadingState: true,
        success: false
      }
    })

    if(this.state.remoteURL.length > -1){
      AddLabbookRemoteMutation(
        localStorage.getItem('username'),
        this.props.labbookName,
        'origin',
        remote,
        this.props.labbookId,
        (error)=>{
          if(error){

            store.dispatch({
              type: 'UPLOAD_MESSAGE',
              payload: {
                uploadMessage: 'Could not add remote.',
                error: false,
                loadingState: true,
                success: false
              }
            })
          }else{

            self.setState({'addedRemoteThisSession': true})
            store.dispatch({
              type: 'UPLOAD_MESSAGE',
              payload: {
                uploadMessage: 'Pushing to remote ...',
                error: false,
                loadingState: true,
                success: false
              }
            })
            let labbookName = self.props.labbookName;
            let username = localStorage.getItem('username')
            PushActiveBranchToRemoteMutation(
              localStorage.getItem('username'),
              self.props.labbookName,
              'origin',
              self.props.labbookId,
              (error)=>{
                if(error){
                  console.log(error)
                  store.dispatch({
                    type: 'UPLOAD_MESSAGE',
                    payload: {
                      uploadMessage: 'Could not push code to server, remote was added succesfully',
                      error: false,
                      loadingState: true,
                      success: false
                    }
                  })
                }else{
                  store.dispatch({
                    type: 'UPLOAD_MESSAGE',
                    payload: {
                      uploadMessage: `Added remote repo.gigantum.io/${username}/${labbookName}`,
                      error: false,
                      loadingState: true,
                      success: false
                    }
                  })
                }
              }
            )
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
      type: 'UPLOAD_MESSAGE',
      payload: {
        uploadMessage: 'Pulling from remote ...',
        error: false,
        loadingState: true,
        success: false
      }
    })
    PullActiveBranchFromRemoteMutation(
      localStorage.getItem('username'),
      this.props.labbookName,
      'origin',
      this.props.labbookId,
      (error)=>{
        if(error){
          console.log(error)

          store.dispatch({
            type: 'UPLOAD_MESSAGE',
            payload: {
              uploadMessage: 'Could not pull from remote',
              error: true,
              loadingState: true,
              success: false
            }
          })
        }else{
          store.dispatch({
            type: 'UPLOAD_MESSAGE',
            payload: {
              uploadMessage: 'Pushing to remote ...',
              error: false,
              loadingState: true,
              success: false
            }

          })

          PushActiveBranchToRemoteMutation(
            localStorage.getItem('username'),
            this.props.labbookName,
            'origin',
            this.props.labbookId,
            (error)=>{
              console.log(error)
              if(error){
                console.log(error)
                store.dispatch({
                  type: 'UPLOAD_MESSAGE',
                  payload: {
                    uploadMessage: 'Could not push to remote',
                    error: false,
                    loadingState: true,
                    success: false
                  }
                })
              }

              store.dispatch({
                type: 'UPLOAD_MESSAGE',
                payload: {
                  uploadMessage: 'Sync Complete',
                  error: false,
                  loadingState: true,
                  success: false
                }
              })
            }
          )
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
      localStorage.getItem('username'),
      this.props.labbookName,
      'origin',
      this.props.labbookId,
      (error)=>{
        if(error){
          console.log(error)
        }
      }
    )
  }

  _togglePublish(){
    this.setState({'addedRemoteThisSession': !this.state.addedRemoteThisSession})
  }
  render(){
    const {tags} = this.state;

    return(
      <div className="BranchMenu flex flex--column">
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
              onKeyUp={(evt)=>{this._setNewBranchName(evt)}}
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
            <ul>
              <li className="BranchMenu__item--new-branch">
                <a onClick={()=>{this._toggleModal('createBranchVisible')}}>New Branch</a>
              </li>
              <li className="BranchMenu__item--merge" onClick={()=>{this._togglePublish()}}>Merge</li>
              <li className="BranchMenu__item--deadend">Dead-end</li>
              <li className="BranchMenu__item--favorite">Favorite</li>
            </ul>
            <hr />
            {/* <button>Publish</button> */}
            {!this.state.addedRemoteThisSession &&
              <div className="BranchMenu__publish">
                <button
                  onClick={()=>{this._addRemote()}}
                  >
                  Publish
                </button>
              </div>
            }

            { this.state.addedRemoteThisSession &&
              <div className="BranchMenu__sync">
                <button

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

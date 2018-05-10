//vendor
import React, { Component } from 'react'
import uuidv4 from 'uuid/v4'
import classNames from 'classnames'
//muations
import ImportRemoteLabbookMutation from 'Mutations/ImportRemoteLabbookMutation'
import BuildImageMutation from 'Mutations/BuildImageMutation'
//store
import store from 'JS/redux/store'
//queries
import UserIdentity from 'JS/Auth/UserIdentity'
//components
import LoginPrompt from 'Components/labbook/branchMenu/LoginPrompt'
import Loader from 'Components/shared/Loader';

export default class LocalLabbookPanel extends Component {

  constructor(props) {
    super(props);

    this.state = {
      'labbookName': props.edge.node.name,
      'owner': props.edge.node.owner,
      'isImporting': false,
      'showLoginPrompt': false,
    }
    this._importingState = this._importingState.bind(this)
    this._clearState = this._clearState.bind(this)
    this._closeLoginPromptModal = this._closeLoginPromptModal.bind(this)
    this._handleDelete = this._handleDelete.bind(this)
  }

  _handleDelete(edge) {
    UserIdentity.getUserIdentity().then(response => {
      if(response.data){
        if(response.data.userIdentity.isSessionValid){
          this.props.toggleDeleteModal({remoteId: edge.node.id, remoteOwner: edge.node.owner, remoteLabbookName: edge.node.name, existsLocally: this.props.existsLocally})
        } else {
          this.setState({'showLoginPrompt': true})
          document.getElementById('modal__cover').classList.remove('hidden')
        }
      }
    })

  }

  _closeLoginPromptModal() {
    this.setState({
      'showLoginPrompt': false
    })
    document.getElementById('modal__cover').classList.add('hidden')
  }

  _clearState = () => {
    this.setState({
      isImporting: false
    })
  }

  _importingState = () => {
    this.setState({
      isImporting: true
    })
  }

  /**
    *  @param {owner, labbookName}
    *  imports labbook from remote url, builds the image, and redirects to imported labbook
    *  @return {}
  */
 importLabbook = (owner, labbookName) => {
  let self = this;
  const id = uuidv4()
  let remote = `https://repo.gigantum.io/${owner}/${labbookName}`

  UserIdentity.getUserIdentity().then(response => {

  if(response.data){

    if(response.data.userIdentity.isSessionValid){
      this._importingState()
      store.dispatch(
        {
          type: "MULTIPART_INFO_MESSAGE",
          payload: {
            id: id,
            message: 'Importing LabBook please wait',
            isLast: false,
            error: false
          }
        })
      ImportRemoteLabbookMutation(
        owner,
        labbookName,
        remote,
        (response, error) => {
          this._clearState();

          if(error){
            console.error(error)
            store.dispatch(
              {
                type: 'MULTIPART_INFO_MESSAGE',
                payload: {
                  id: id,
                  message: 'ERROR: Could not import remote LabBook',
                  messageBody: error,
                  error: true
              }
            })

          }else if(response){

            store.dispatch(
              {
                type: 'MULTIPART_INFO_MESSAGE',
                payload: {
                  id: id,
                  message: `Successfully imported remote LabBook ${labbookName}`,
                  isLast: true,
                  error: false
                }
              })
            BuildImageMutation(
            labbookName,
            owner,
            false,
            (response, error)=>{
              if(error){
                console.error(error)
                store.dispatch(
                  {
                    type: 'MULTIPART_INFO_MESSAGE',
                    payload: {
                      id: id,
                      message: `ERROR: Failed to build ${labbookName}`,
                      messsagesList: error,
                      error: true
                  }
                })
              }
            })
            document.getElementById('modal__cover').classList.add('hidden')
            self.props.history.replace(`/labbooks/${owner}/${labbookName}`)
          }else{

            BuildImageMutation(
            labbookName,
            localStorage.getItem('username'),
            false,
            (error)=>{
              if(error){
                console.error(error)
                store.dispatch(
                  {
                    type: 'MULTIPART_INFO_MESSAGE',
                    payload: {
                      id: id,
                      message: `ERROR: Failed to build ${labbookName}`,
                      messsagesList: error,
                      error: true
                  }
                })
              }
            })
          }
        }
      )
    }else{
        this.setState({'showLoginPrompt': true})
        document.getElementById('modal__cover').classList.remove('hidden')
    }
    }
  })
}

  render(){
    let edge = this.props.edge;
    let loginPromptModalCss = classNames({
      'Labbooks--login-prompt': this.state.showLoginPrompt,
      'hidden': !this.state.showLoginPrompt
    })
    let descriptionCss = classNames({
      'RemoteLabbooks__text-row': true,
      'blur': this.state.isImporting
    })
    return (
      <div
        key={edge.node.name}
        className='RemoteLabbooks__panel column-4-span-3 flex flex--column justify--space-between'>
        {

        }
        <div className="RemoteLabbooks__icon-row">
        {
          this.props.existsLocally ?
          <button
            className="RemoteLabbooks__cloud-download--exists"
            disabled={true}
          ></button>
          :
          <button
            disabled={this.state.isImporting}
            className="RemoteLabbooks__cloud-download"
            onClick={()=>this.importLabbook(edge.node.owner, edge.node.name)}
          ></button>
        }
          <button
            disabled={this.state.isImporting || localStorage.getItem('username') !== edge.node.owner}
            title={localStorage.getItem('username') !== edge.node.owner ?  'You can only delete remote labbooks created by you.' : '' }
            className="RemoteLabbooks__cloud-delete"
            onClick={() => this._handleDelete(edge)}
          ></button>
        </div>

        <div className={descriptionCss}>
          <div className="RemoteLabbooks__title-row">
            <h6
              className="RemoteLabbooks__panel-title">
              {edge.node.name}
            </h6>

          </div>
          <p className="RemoteLabbooks__owner">{'Created by ' + edge.node.owner}</p>
          <p
            className="RemoteLabbooks__description">
            {edge.node.description ? edge.node.description : this.props.localDescription}
          </p>
        </div>
        {
          this.state.isImporting &&
          <div className="RemoteLabbooks__loader">
            <Loader/>
          </div>
        }

        <div className={loginPromptModalCss}>
          <div
            onClick={() => { this._closeLoginPromptModal() }}
            className="Labbooks-login-prompt--close"></div>
          <LoginPrompt closeModal={this._closeLoginPromptModal} />
        </div>
    </div>)
  }
}

//vendor
import React, { Component } from 'react'
import uuidv4 from 'uuid/v4'
import Highlighter from 'react-highlight-words'
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

export default class RemoteLabbookPanel extends Component {

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

  /**
    * @param {object} edge
    * validates user's session and then triggers toggleDeleteModal which passes parameters to the DeleteLabbook component
  */
  _handleDelete(edge) {
    if(localStorage.getItem('username') !== edge.node.owner){
      store.dispatch({
        type: 'WARNING_MESSAGE',
        payload: {
          message: 'You can only delete remote Projects that you have created.',
        }
      })
    } else {
      UserIdentity.getUserIdentity().then(response => {
      if(navigator.onLine){
          if(response.data){
            if(response.data.userIdentity.isSessionValid){
              this.props.toggleDeleteModal({remoteId: edge.node.id, remoteOwner: edge.node.owner, remoteLabbookName: edge.node.name, existsLocally: this.props.existsLocally})
            } else {
              this.props.auth.renewToken(true, ()=>{
                this.setState({'showLoginPrompt': true})
              }, ()=>{
                this.props.toggleDeleteModal({remoteId: edge.node.id, remoteOwner: edge.node.owner, remoteLabbookName: edge.node.name, existsLocally: this.props.existsLocally})
              })
            }
          }
        } else{
          this.setState({'showLoginPrompt': true})
        }
      })
    }
  }

  /**
    * @param {}
    * fires when user identity returns invalid session
    * prompts user to revalidate their session
  */
  _closeLoginPromptModal() {
    this.setState({
      'showLoginPrompt': false
    })
  }

  /**
    *  @param {}
    *  changes state of isImporting to false
  */
  _clearState = () => {
    this.setState({
      isImporting: false
    })
  }
  /**
    *  @param {}
    *  changes state of isImporting to true
  */
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
    if(navigator.onLine){
      if(response.data){

        if(response.data.userIdentity.isSessionValid){
          this._importingState()
          store.dispatch(
            {
              type: "MULTIPART_INFO_MESSAGE",
              payload: {
                id: id,
                message: 'Importing Project please wait',
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
                        message: 'ERROR: Could not import remote Project',
                        messageBody: error,
                        error: true
                  }
                })

              }else if(response){

                store.dispatch({
                    type: 'MULTIPART_INFO_MESSAGE',
                    payload: {
                        id: id,
                        message: `Successfully imported remote Project ${labbookName}`,
                        isLast: true,
                        error: false
                    }
                 })

                const labbookName = response.importRemoteLabbook.newLabbookEdge.node.name
                const owner = response.importRemoteLabbook.newLabbookEdge.node.owner

                BuildImageMutation(
                labbookName,
                owner,
                false,
                (response, error)=>{

                  if(error){

                    console.error(error)

                    store.dispatch({
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

                  self.props.history.replace(`/projects/${owner}/${labbookName}`)
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
          this.props.auth.renewToken(true, ()=>{
            this.setState({'showLoginPrompt': true})
          }, ()=>{
            this.importLabbook(owner, labbookName)
          });
        }
      }
    } else{
      this.setState({'showLoginPrompt': true})
    }
  })
}

  render(){
    let edge = this.props.edge;
    let descriptionCss = classNames({
      'RemoteLabbooks__text-row': true,
      'blur': this.state.isImporting
    })
    let deleteCSS = classNames({
      'RemoteLabbooks__cloud-delete': localStorage.getItem('username') === edge.node.owner,
      'RemoteLabbooks__cloud-delete--disabled': localStorage.getItem('username') !== edge.node.owner,
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
            className={deleteCSS}
            disabled={this.state.isImporting}
            onClick={() => this._handleDelete(edge)}
          ></button>
        </div>

        <div className={descriptionCss}>
          <div className="RemoteLabbooks__title-row">
            <h6
              className="RemoteLabbooks__panel-title">
              <Highlighter
                highlightClassName='LocalLabbooks__highlighted'
                searchWords={[store.getState().labbookListing.filterText]}
                autoEscape={false}
                caseSensitive={false}
                textToHighlight={edge.node.name}
              />
            </h6>

          </div>
          <p className="RemoteLabbooks__owner">{'Created by ' + edge.node.owner}</p>
          <p
            className="RemoteLabbooks__description">
            <Highlighter
              highlightClassName='LocalLabbooks__highlighted'
              searchWords={[store.getState().labbookListing.filterText]}
              autoEscape={false}
              caseSensitive={false}
              textToHighlight={edge.node.description}
            />
          </p>
        </div>
        { !(edge.node.visibility === 'local') &&
          <div data-tooltip={`${edge.node.visibility}`} className={`Tooltip RemoteLabbooks__${edge.node.visibility}`}></div>
        }
        {
          this.state.isImporting &&
          <div className="RemoteLabbooks__loader">
            <Loader/>
          </div>
        }

        {
          this.state.showLoginPrompt &&
          <LoginPrompt closeModal={this._closeLoginPromptModal} />
        }
    </div>)
  }
}

//vendor
import React, { Component } from 'react'
import ReactMarkdown from 'react-markdown'
//mutations
import AddCustomDockerMutation from 'Mutations/AddCustomDockerMutation'
//store
import store from 'JS/redux/store'
//config
import config from 'JS/config'

export default class CustomDockerfile extends Component {
  constructor(props){
    super(props);
    this.state = {
      dockerfileContent: this.props.dockerfile,
      lastSavedDockerfileContent: this.props.dockerfile,
      editingDockerfile: false,
      savingDockerfile: false,
    }
  }

  _saveDockerfile() {
    const {status} = store.getState().containerStatus;
    const canEditEnvironment = config.containerStatus.canEditEnvironment(status) && !this.props.isLocked
    const { owner, labbookName } = store.getState().routes
    if(navigator.onLine) {
      if(canEditEnvironment) {
        this.setState({savingDockerfile: true})
        AddCustomDockerMutation(
          owner,
          labbookName,
          this.state.dockerfileContent,
          (res, error) => {
            if(error) {
              console.log(error)
              store.dispatch({
                type: 'ERROR_MESSAGE',
                payload: {
                  message: 'Dockerfile was not set: ',
                  messageBody: error
                }
              })
            } else {
              this.props.buildCallback();
              this.setState({ editingDockerfile: false, lastSavedDockerfileContent: this.state.dockerfileContent, savingDockerfile: false})
            }
          }
        )
      } else {
        store.dispatch({
          type: 'UPDATE_CONTAINER_MENU_VISIBILITY',
          payload: {
            containerMenuOpen: true
          }
        })

        store.dispatch({
          type: 'CONTAINER_MENU_WARNING',
          payload: {
            message: 'Stop LabBook before editing the environment. \n Be sure to save your changes.'
          }
        })
      }
    } else {
      store.dispatch({
        type: 'ERROR_MESSAGE',
        payload:{
          message: `Cannot remove package at this time.`,
          messageBody: [{message: 'An internet connection is required to modify the environment.'}]
        }
      })
    }

  }

  _editDockerfile() {
    const {status} = store.getState().containerStatus;
    const canEditEnvironment = config.containerStatus.canEditEnvironment(status) && !this.props.isLocked
    if(canEditEnvironment) {
      this.setState({editingDockerfile: true});
    } else {
      store.dispatch({
        type: 'UPDATE_CONTAINER_MENU_VISIBILITY',
        payload: {
          containerMenuOpen: true
        }
      })

      store.dispatch({
        type: 'CONTAINER_MENU_WARNING',
        payload: {
          message: 'Stop LabBook before editing the environment. \n Be sure to save your changes.'
        }
      })
    }

  }


  render() {
    let dockerfileCSS = this.state.dockerfileContent ? 'column-1-span-9' : 'column-1-span-9 empty'
    return (
      <div className="CustomDockerfile">
        <div className="Environment__header-container">
          <h5 className="CustomDockerfile__header">
            Custom Dockerfile
          </h5>
        </div>
        <p className="CustomDockerfile__sub-header">
            Add commands below to modify your environment
        </p>
        <div className="CustomDockerfile__content grid column-1-span-12">
        {
            this.state.editingDockerfile ?
            <React.Fragment>
              <textarea
                className="CustomDockerfile__content-input column-1-span-9"
                type="text"
                onChange={(evt)=>{this.setState({dockerfileContent: evt.target.value})}}
                placeholder="Enter dockerfile commands here"
                defaultValue={this.state.dockerfileContent ? this.state.dockerfileContent: ''}
              >
              </textarea>
              <div className="column-1-span-1">
                <button
                  disabled={this.state.savingDockerfile}
                  onClick={()=> this._saveDockerfile()}
                  className="CustomDockerfile__content-save-button"
                >
                  Save
                </button>
                <button
                  onClick={()=> this.setState({editingDockerfile: false, dockerfileContent: this.state.lastSavedDockerfileContent })}
                  className="CustomDockerfile__content-cancel-button button--flat"
                >
                  Cancel
                </button>
              </div>
            </React.Fragment>
            :
            <React.Fragment>
              <div className={dockerfileCSS}>
                <p className={dockerfileCSS} >
                  {this.state.dockerfileContent ? this.state.dockerfileContent : 'No commands provided.'}
                </p>
              </div>
              <div className="column-1-span-1">
                <button
                  onClick={()=> this._editDockerfile()}
                  className="CustomDockerfile__content-edit-button"
                >
                </button>
              </div>
            </React.Fragment>
          }
        </div>


      </div>
    )
  }

}
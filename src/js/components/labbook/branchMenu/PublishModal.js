//vendor
import React, { Component, Fragment } from 'react'
import uuidv4 from 'uuid/v4'
//mutations
import PublishLabbookMutation from 'Mutations/branches/PublishLabbookMutation'
//component
import Modal from 'Components/shared/Modal'
//store
import store from 'JS/redux/store'


export default class PublishModal extends Component {
  state={
    'public': false
  }
  _setPublic(isPublic){
    this.setState({
      isPublic
    })
  }
  /**
  *  @param {}
  *  adds remote url to labbook
  *  @return {string}
  */
  _publishLabbook() {

      let id = uuidv4()
      let self = this;

      this.props.togglePublishModal()

      const {
        owner,
        labbookName,
        labbookId} = this.props;



      this.props.checkSessionIsValid().then((response) => {

        if(navigator.onLine){
          if (response.data) {

            if (response.data.userIdentity.isSessionValid) {
              if(store.getState().containerStatus.status !== 'Running'){
                self.props.resetPublishState(true)

              if (!self.props.remoteUrl) {
                self.props.setPublishingState(true)

                self.props.showContainerMenuMessage('publishing');

                store.dispatch({
                  type: 'MULTIPART_INFO_MESSAGE',
                  payload: {
                    id: id,
                    message: 'Publishing Project to Gigantum cloud ...',
                    isLast: false,
                    error: false
                  }
                })


                  PublishLabbookMutation(
                    owner,
                    labbookName,
                    labbookId,
                    this.state.isPublic,
                    (response, error) => {

                      self.props.setPublishingState(false)

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

                      self.props.resetPublishState(false)

                      if (response.publishLabbook && response.publishLabbook.success) {

                        self.props.remountCollab();

                        store.dispatch({
                          type: 'MULTIPART_INFO_MESSAGE',
                          payload: {
                            id: id,
                            message: `Added remote https://gigantum.com/${self.props.owner}/${self.props.labbookName}`,
                            isLast: true,
                            error: false
                          }
                        })

                        self.props.setRemoteSession()
                      }
                    }
                  )
                }
              } else {

                self.props.showContainerMenuMessage('publishing', true)
              }

            } else {

              self.props.auth.renewToken(true, ()=>{

                self.props.resetState()

              }, ()=>{
                self._publishLabbook();
              });
            }
          }
        } else{
          self.props.resetState()
        }
      })
  }


  render(){

    return(
      <Modal
        header="Publish"
        handleClose={()=> this.props.togglePublishModal() }
        size="large"
        renderContent={()=>
          <div className="PublishModal">
            <div>
              <p>You are about to publish a Project to Gigantum cloud. Select public or private below.</p>
            </div>
            <div className="Publish__radio-buttons">
              <div className="Publish__private">
                <input
                  defaultChecked={!this.state.isPublic}
                  type="radio"
                  name="publish"
                  id="publish_private"
                  onClick={()=>{this._setPublic(false)}}
                />
                <label htmlFor="publish_private">
                  <b>Private</b>
                </label>

                <p className="Publish__paragraph">Private projects are only visible to collaborators. Users that are added as a collaborator will be able to view and edit.</p>
              </div>
              <div className="Publish__public">
                <input
                  defaultChecked={this.state.isPublic}
                  name="publish"
                  type="radio"
                  id="publish_public"
                  onClick={()=>{this._setPublic(true)}}
                />
                <label htmlFor="publish_public">
                  <b>Public</b>
                </label>
                <p className="Publish__paragraph">Public projects are visible to everyone. Users will be able to import a copy. Only users that are added as a collaborator will be able to edit.</p>
              </div>
            </div>
            <div className="Publish__buttons">
               <button onClick={()=>{this._publishLabbook()}}>Publish</button>
              <button className="button--flat" onClick={()=>{this.props.togglePublishModal()}}>Cancel</button>
            </div>
          </div>
        }
      />
    )
  }
}

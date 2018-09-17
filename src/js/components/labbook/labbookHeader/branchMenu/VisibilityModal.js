//vendor
import React, { Component } from 'react'
//mutations
import SetVisibilityMutation from 'Mutations/SetVisibilityMutation'
//component
import Modal from 'Components/shared/Modal'
//store
import { setErrorMessage, setInfoMessage } from 'JS/redux/reducers/footer'

export default class PublishModal extends Component {
  state={
    'isPublic': this.props.visibility === 'public'
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
  _changeVisibility() {

      let self = this;
      let visibility = this.state.isPublic ? 'public': 'private';
      this.props.toggleVisibilityModal()

      const {
        owner,
        labbookName} = this.props;



      this.props.checkSessionIsValid().then((response) => {

        if(navigator.onLine){
          if (response.data) {

            if (response.data.userIdentity.isSessionValid) {

              if (this.props.visibility !== visibility) {
                SetVisibilityMutation(
                    owner,
                    labbookName,
                    visibility,
                    (response, error) => {

                      if(error){
                        console.log(error)
                        setErrorMessage('Visibility change failed', error)
                      } else {
                        setInfoMessage(`Visibility changed to ${visibility}`)
                      }
                    }
                  )
                }

            } else {

              self.props.auth.renewToken(true, ()=>{

                self.props.resetState()

              }, ()=>{
                self._changeVisibility();
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
        header="Change Visibility"
        handleClose={()=> this.props.toggleVisibilityModal() }
        size="large"
        renderContent={()=>
          <div className="PublishModal">
            <div>
              <p>You are about to change the visibility of the project.</p>
            </div>
            <div className="Publish__radio-buttons">
              <div className="Publish__private">
                <input
                  defaultChecked={this.props.visibility === 'private'}
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
                  defaultChecked={this.props.visibility === 'public'}
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
               <button onClick={()=>{this._changeVisibility()}}>Save</button>
              <button className="button--flat" onClick={()=>{this.props.toggleVisibilityModal()}}>Cancel</button>
            </div>
          </div>
        }
      />
    )
  }
}